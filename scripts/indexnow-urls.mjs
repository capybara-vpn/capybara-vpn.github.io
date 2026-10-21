#!/usr/bin/env node
/**
 * Список URL, которые изменились в последнем коммите — для IndexNow.
 *
 * Bing просит не слать пачкой: точечное уведомление быстрее попадает в индекс
 * и не тратит краул-бюджет на страницы, которые не менялись. Поэтому здесь
 * считаются только те страницы, чьи исходники тронул последний коммит.
 *
 * Правила:
 *   src/pages/<slug>.astro      → /<slug>/  (index.astro → /)
 *   общие файлы (layout, стили, данные, конфиг) → весь сайт
 *   удалённая страница           → её URL тоже уходит: поисковик увидит 404
 *   остальное (public/, README)  → ничего: страницы не менялись
 *
 * Вывод: URL, по одному в строке.
 */
import { execSync } from 'node:child_process';

const ORIGIN = (process.env.SITE_URL || 'https://capybaravpn.top').replace(/\/+$/, '');

/** Файлы, которые меняют все страницы сразу. */
const SITE_WIDE = /^(src\/(layouts|components|styles|lib|data)\/|astro\.config\.mjs$|package(-lock)?\.json$)/;

function git(...args) {
  try {
    return execSync(`git ${args.join(' ')}`, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

// Первый коммит сравнивать не с чем — тогда уведомляем весь сайт.
const changed = git('diff', '--name-only', 'HEAD~1', 'HEAD');
const files = changed ? changed.split('\n').filter(Boolean) : [];

if (!files.length) {
  console.error('Изменений нет — IndexNow не отправляем.');
  process.exit(0);
}

const siteWide = files.some((f) => SITE_WIDE.test(f));
const pageFiles = files.filter((f) => f.startsWith('src/pages/') && f.endsWith('.astro'));

if (siteWide) {
  // Общее изменение: sitemap с прода уже содержит все актуальные URL.
  const res = await fetch(`${ORIGIN}/sitemap-index.xml`);
  const index = await res.text();
  const children = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  let urls = [];
  for (const child of children) {
    const xml = await (await fetch(child)).text();
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }
  for (const url of urls) console.log(url);
  process.exit(0);
}

for (const file of pageFiles) {
  const slug = file.replace(/^src\/pages\//, '').replace(/\.astro$/, '');
  console.log(slug === 'index' ? `${ORIGIN}/` : `${ORIGIN}/${slug}/`);
}
