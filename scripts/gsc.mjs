#!/usr/bin/env node
/**
 * Google Search Console: разом проверить индексацию всех страниц и
 * отправить карту сайта после деплоя.
 *
 * Что умеет:
 *   node scripts/gsc.mjs status   — индексирован ли каждый URL (одна проверка)
 *   node scripts/gsc.mjs status --only-missing --json
 *   node scripts/gsc.mjs submit   — сказать Google «карта сайта изменилась»
 *
 * Переменные окружения:
 *   GSC_SITE                    домен (по умолчанию SITE_URL или https://capybaravpn.top)
 *   GSC_SITEMAP                файл карты (по умолчанию sitemap-index.xml)
 *   GSC_SERVICE_ACCOUNT_KEY    JSON ключа сервис-аккаунта одной строкой
 *   GSC_KEY_FILE               путь к файлу ключа (альтернатива)
 *
 * Про «Запросить индексацию» в веб-интерфейсе Search Console: такого
 * публичного API у Google нет — кнопка дёргает внутренний эндпоинт, и
 * автоматизировать её нельзя. Ближайший рабочий эквивалент — отправка
 * карты сайта (submit): Google видит, что lastmod обновился, и идёт
 * переобходить страницы. Плюс status показывает, что именно ещё не
 * проиндексировано, чтобы не прокликивать вручную то, что уже в индексе.
 */

import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const SITE = (process.env.GSC_SITE || process.env.SITE_URL || 'https://capybaravpn.top').replace(/\/+$/, '');
const SITEMAP = process.env.GSC_SITEMAP || 'sitemap-index.xml';
const SCOPE = 'https://www.googleapis.com/auth/webmasters';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SITEMAPS_API = 'https://www.googleapis.com/webmasters/v3';
const INSPECT_URL = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith('-')) || 'status';
const hasFlag = (name) => args.includes(`--${name}`);

/** E-mail сервис-аккаунта: нужен, чтобы добавить его в Search Console. */
let clientEmail = '';

const b64url = (buf) => Buffer.from(buf).toString('base64url');

/** fetch с таймаутом: одна зависшая страница не должна держать весь прогон. */
async function fetchTimeout(url, options = {}, ms = 30000) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(ms) });
}

/**
 * Ограниченная параллельность: инспекция Google по одной странице занимает
 * несколько секунд, поэтому по очереди 34 страницы шли бы две минуты.
 * Пять одновременно — и быстро, и в пределах квоты.
 */
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

/** Ключ сервис-аккаунта: из переменной окружения или из файла. */
async function readKey() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_KEY;
  if (raw && raw.trim()) return JSON.parse(raw);
  const file = process.env.GSC_KEY_FILE;
  if (file) return JSON.parse(await readFile(file, 'utf8'));
  return null;
}

/**
 * Обмен подписанного JWT на access_token.
 * Подпись — RSA-SHA256 ключом сервис-аккаунта, без внешних зависимостей.
 */
async function accessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const signingInput =
    `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.` +
    `${b64url(JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }))}`;

  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  const assertion = `${signingInput}.${b64url(signer.sign(key.private_key))}`;

  const res = await fetchTimeout(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `токен не получен (${res.status}): ${body.error_description || body.error || 'неизвестная ошибка'}`,
    );
  }
  return body.access_token;
}

/** Все <loc> из карты сайта (индекс карт тоже распаковываем). */
async function siteUrls() {
  const readLocs = async (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  const indexRes = await fetchTimeout(`${SITE}/${SITEMAP}`);
  if (!indexRes.ok) throw new Error(`карта ${SITEMAP} недоступна (${indexRes.status})`);
  const indexXml = await indexRes.text();

  // Файл карты со списком <url> или индекс со списком <sitemap>.
  const own = await readLocs(indexXml);
  if (own.length && !/<sitemap>/.test(indexXml)) return own;

  const urls = [];
  for (const child of own) {
    const res = await fetchTimeout(child);
    if (!res.ok) continue;
    urls.push(...(await readLocs(await res.text())));
  }
  return urls;
}

/**
 * Отправить карту сайта: Google переобходит страницы с обновлённым lastmod.
 * Метод — PUT (в актуальной документации Google POST больше не работает),
 * адрес карты передаётся закодированным ровно один раз.
 */
async function submit(token) {
  let lastError = '';
  for (const { site, feed } of siteCandidates(SITE)) {
    const url = `${SITEMAPS_API}/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(feed)}`;
    const res = await fetchTimeout(url, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`  карта отправлена: ${feed} (${site}, ${res.status})`);
      return;
    }
    lastError = body.error?.message || `HTTP ${res.status}`;
  }
  throw new Error(`отправка не удалась: ${lastError}`);
}

/**
 * Формы адреса свойства, которые Google принимает:
 *   sc-domain:site         — свойство «Домен»
 *   https://site/          — свойство «URL-префикс»
 * К каждой форме прилагается feedpath, который ждёт API: у домена это
 * полный URL карты, у префикса — путь от корня.
 */
function siteCandidates(site) {
  const host = new URL(site).host;
  return [
    { site: `sc-domain:${host}`, feed: `${site}/${SITEMAP}` },
    { site: `${site}/`, feed: SITEMAP },
    { site, feed: SITEMAP },
  ];
}

/** Проверка одной страницы через URL Inspection API. */
async function inspect(token, url, siteUrl = SITE) {
  const res = await fetchTimeout(INSPECT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteUrl, inspectionUrl: url, languageCode: 'ru-RU' }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body.error?.message || `HTTP ${res.status}`;
    // Самая частая причина: сервис-аккаунт не добавлен в свойство.
    const hint = /do not own this site/i.test(message)
      ? 'сервис-аккаунт не добавлен в Search Console — добавьте его в свойство домена (Настройки → Пользователи и разрешения)'
      : '';
    return { url, error: message, hint };
  }
  const r = body.inspectionResult?.indexStatusResult || {};
  return {
    url,
    verdict: r.verdict || '?',
    coverage: r.coverageState || '',
    robots: r.robotsTxtState || '',
    fetch: r.pageFetchState || '',
    lastCrawl: r.lastCrawlTime || '',
    canonical: r.googleCanonical || '',
  };
}

/** Человеческое «в индексе / не в индексе» по ответу инспекции. */
function label(row) {
  if (row.error) return 'ошибка';
  if (row.verdict === 'PASS' && /indexed/i.test(row.coverage)) return 'в индексе';
  if (row.verdict === 'PASS') return 'в индексе';
  return 'НЕ в индексе';
}

async function status(token) {
  const urls = await siteUrls();
  if (!urls.length) throw new Error('в карте сайта нет ни одного URL');

  // Какой формой адреса заведено свойство — перебираем на одной странице.
  let siteUrl = SITE;
  for (const candidate of siteCandidates(SITE)) {
    const probe = await inspect(token, urls[0], candidate.site);
    if (!probe.hint) {
      siteUrl = candidate.site;
      break;
    }
  }
  console.log(`  свойство: ${siteUrl}`);

  const rows = await mapLimit(urls, 5, async (url, i) => {
    const row = await inspect(token, url, siteUrl);
    process.stdout.write(`\r  проверено ${i + 1}/${urls.length}   `);
    return row;
  });
  process.stdout.write('\n');

  const missing = rows.filter((r) => label(r) === 'НЕ в индексе');
  const broken = rows.filter((r) => r.error);

  if (hasFlag('json')) {
    console.log(JSON.stringify({ site: SITE, total: rows.length, missing: missing.length, rows }, null, 2));
    return;
  }

  const shown = hasFlag('only-missing') ? missing : rows;
  // Если не прошла ни одна проверка и причина одна и та же — доступа нет.
  const noAccess = broken.filter((r) => r.hint);
  if (rows.length && noAccess.length === rows.length) {
    console.log(`  ${SITE}: сервис-аккаунт не имеет доступа к свойству.`);
    console.log(`  ${noAccess[0].hint}.`);
    console.log(`  E-mail аккаунта: ${clientEmail}`);
    console.log('  Что сделать: Search Console → выбрать свойство домена → Настройки →');
    console.log('  Пользователи и разрешения → Добавить пользователя → вставить этот e-mail.');
    return;
  }
  let hintShown = false;
  for (const row of shown) {
    if (row.error) {
      console.log(`  ✗ ${row.url.replace(SITE, '')}\n      ${row.error}`);
      if (row.hint && !hintShown) {
        console.log(`      ${row.hint}`);
        hintShown = true;
      }
      continue;
    }
    const mark = label(row) === 'в индексе' ? '✓' : '·';
    const extra = row.lastCrawl ? `  обход: ${row.lastCrawl.slice(0, 10)}` : '';
    console.log(`  ${mark} ${row.url.replace(SITE, '')}\n      ${row.coverage || row.verdict}${extra}`);
  }
  console.log(
    `\n  ${rows.length - missing.length - broken.length} из ${rows.length} в индексе` +
      (missing.length ? `, не в индексе: ${missing.length}` : '') +
      (broken.length ? `, ошибок проверки: ${broken.length}` : ''),
  );
  if (missing.length) {
    console.log('  Не проиндексированные — их стоит «Запросить индексацию» вручную.');
  }
}

async function main() {
  if (command !== 'status' && command !== 'submit') {
    console.error('Неизвестная команда. Доступны:\n  status  — индексирован ли каждый URL\n  submit  — отправить карту сайта');
    process.exit(2);
  }
  const key = await readKey();
  if (!key) {
    console.error(
      'Нет ключа сервис-аккаунта. Задайте GSC_SERVICE_ACCOUNT_KEY (JSON) или GSC_KEY_FILE (путь).\n' +
        'Инструкция — в README, раздел «Индексация в Google».',
    );
    process.exit(2);
  }
  const token = await accessToken(key);
  clientEmail = key.client_email;
  console.log(`  домен: ${SITE}`);
  console.log(`  аккаунт: ${clientEmail}`);
  if (command === 'submit') await submit(token);
  else await status(token);
}

main().catch((e) => {
  console.error(`Ошибка: ${e.message}`);
  process.exit(1);
});
