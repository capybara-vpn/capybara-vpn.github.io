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

const b64url = (buf) => Buffer.from(buf).toString('base64url');

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

  const res = await fetch(TOKEN_URL, {
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

  const indexRes = await fetch(`${SITE}/${SITEMAP}`);
  if (!indexRes.ok) throw new Error(`карта ${SITEMAP} недоступна (${indexRes.status})`);
  const indexXml = await indexRes.text();

  // Файл карты со списком <url> или индекс со списком <sitemap>.
  const own = await readLocs(indexXml);
  if (own.length && !/<sitemap>/.test(indexXml)) return own;

  const urls = [];
  for (const child of own) {
    const res = await fetch(child);
    if (!res.ok) continue;
    urls.push(...(await readLocs(await res.text())));
  }
  return urls;
}

/** Отправить карту сайта: Google переобходит страницы с обновлённым lastmod. */
async function submit(token) {
  const url = `${SITEMAPS_API}/sites/${encodeURIComponent(SITE)}/sitemaps/${encodeURIComponent(SITEMAP)}`;
  const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`отправка не удалась (${res.status}): ${body.error?.message || JSON.stringify(body)}`);
  }
  console.log(`  карта отправлена: ${SITE}/${SITEMAP}`);
}

/** Проверка одной страницы через URL Inspection API. */
async function inspect(token, url) {
  const res = await fetch(INSPECT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteUrl: SITE, inspectionUrl: url, languageCode: 'ru-RU' }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { url, error: body.error?.message || `HTTP ${res.status}` };
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

  const rows = [];
  for (const url of urls) {
    rows.push(await inspect(token, url));
    // Пауза между запросами: инспекция — не массовый API, лимиты жёсткие.
    await new Promise((r) => setTimeout(r, 250));
  }

  const missing = rows.filter((r) => label(r) === 'НЕ в индексе');
  const broken = rows.filter((r) => r.error);

  if (hasFlag('json')) {
    console.log(JSON.stringify({ site: SITE, total: rows.length, missing: missing.length, rows }, null, 2));
    return;
  }

  const shown = hasFlag('only-missing') ? missing : rows;
  for (const row of shown) {
    if (row.error) {
      console.log(`  ✗ ${row.url}\n      ${row.error}`);
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
  console.log(`  домен: ${SITE}`);
  if (command === 'submit') await submit(token);
  else await status(token);
}

main().catch((e) => {
  console.error(`Ошибка: ${e.message}`);
  process.exit(1);
});
