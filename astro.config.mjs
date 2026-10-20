import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'node:child_process';

// Deployment: single source is SITE_URL (origin + optional base path).
// Production is the custom domain: SITE_URL=https://capybaravpn.top
// (+ ASTRO_BASE=/, workflow sets both automatically via actions/configure-pages).
// Local default below matches the production root URL.
const FULL = (process.env.SITE_URL ?? 'https://capybaravpn.top').replace(
  /\/$/,
  ''
);
const SITE_ORIGIN = new URL(FULL).origin;
const URL_PATH = new URL(FULL).pathname.replace(/\/$/, '');
const BASE = process.env.ASTRO_BASE ?? (URL_PATH ? `${URL_PATH}/` : '/');

/**
 * Last commit date per page, so the sitemap carries <lastmod> and Google
 * can tell which pages actually changed instead of recrawling all of them.
 */
const PAGE_SOURCES = {
  '/': 'src/pages/index.astro',
  '/tarify/': 'src/pages/tarify.astro',
  '/vless/': 'src/pages/vless.astro',
  '/chto-takoe-vpn/': 'src/pages/chto-takoe-vpn.astro',
  '/probny-den/': 'src/pages/probny-den.astro',
  '/oplata/': 'src/pages/oplata.astro',
  '/ios/': 'src/pages/ios.astro',
  '/android/': 'src/pages/android.astro',
  '/windows/': 'src/pages/windows.astro',
  '/macos/': 'src/pages/macos.astro',
  '/linux/': 'src/pages/linux.astro',
  '/tv/': 'src/pages/tv.astro',
  '/bezopasnost-vpn/': 'src/pages/bezopasnost-vpn.astro',
  '/kak-vybrat-lokaciyu/': 'src/pages/kak-vybrat-lokaciyu.astro',
  '/proverka-skorosti/': 'src/pages/proverka-skorosti.astro',
  '/dlya-novichkov/': 'src/pages/dlya-novichkov.astro',
  '/ne-rabotaet/': 'src/pages/ne-rabotaet.astro',
  '/neskolko-ustroystv/': 'src/pages/neskolko-ustroystv.astro',
  '/telegram-ili-brauzer/': 'src/pages/telegram-ili-brauzer.astro',
  '/router/': 'src/pages/router.astro',
};

const lastmodCache = new Map();
function lastmodFor(pathname) {
  const file = PAGE_SOURCES[pathname];
  if (!file) return undefined;
  if (lastmodCache.has(file)) return lastmodCache.get(file);
  let value;
  try {
    value = execSync(`git log -1 --format=%cI -- ${file}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    value = '';
  }
  if (!value) {
    // No git history (fresh checkout without depth): fall back to the build
    // time so the sitemap is never empty of dates.
    value = new Date().toISOString();
  }
  lastmodCache.set(file, value);
  return value;
}

/**
 * llms-full.txt — the whole site as markdown, so an AI crawler can ingest
 * every guide in one request instead of fetching 13 pages. Built from the
 * rendered HTML, which keeps it in sync with the site by construction.
 */
const LLMS_PAGES = [
  ['index.html', 'Главная'],
  ['tarify/index.html', 'Тарифы подробно'],
  ['vless/index.html', 'Что такое VLESS'],
  ['chto-takoe-vpn/index.html', 'Что такое VPN'],
  ['probny-den/index.html', 'Бесплатный день'],
  ['oplata/index.html', 'Как оплатить'],
  ['ios/index.html', 'Настройка на iOS'],
  ['android/index.html', 'Настройка на Android'],
  ['windows/index.html', 'Настройка on Windows'],
  ['macos/index.html', 'Настройка на macOS'],
  ['linux/index.html', 'Настройка на Linux'],
  ['tv/index.html', 'Настройка на TV'],
  ['router/index.html', 'VPN на роутере'],
  ['bezopasnost-vpn/index.html', 'Безопасность и приватность'],
  ['kak-vybrat-lokaciyu/index.html', 'Как выбрать локацию'],
  ['proverka-skorosti/index.html', 'Как проверить скорость'],
  ['dlya-novichkov/index.html', 'Первый раз с VPN'],
  ['ne-rabotaet/index.html', 'Что делать, если не работает'],
  ['neskolko-ustroystv/index.html', 'Несколько устройств'],
  ['telegram-ili-brauzer/index.html', 'Telegram или браузер'],
];

function htmlToMarkdown(html) {
  // Only the page content: the header, footer, sticky CTA and consent bar
  // are navigation chrome and would only dilute the text for a model.
  const main = html.match(/<main\b[\s\S]*?<\/main>/i);
  const body = main ? main[0] : html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, ' | $1')
    .replace(/<tr[^>]*>/gi, '\n')
    .replace(/<\/(p|div|ul|ol|section|article|blockquote|table|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&middot;/g, '·')
    .replace(/&hellip;/g, '…')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function llmsFullPlugin() {
  return {
    name: 'llms-full-txt',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const { readFile, writeFile } = await import('node:fs/promises');
        const path = await import('node:path');
        const chunks = [
          '# Capybara VPN — полный текст сайта',
          '',
          '> Capybara VPN — VPN-сервис: VLESS, 38 локаций, 100+ серверов, каналы до 10 Гбит/с.',
          '> Тарифы: 30 дней — 249 ₽, 90 дней — 672 ₽, 180 дней — 1195 ₽. Первый день бесплатно (10 ГБ).',
          '',
          `Официальный сайт: [capybaravpn.top](${FULL}/)`,
          `Краткая сводка: [llms.txt](${FULL}/llms.txt)`,
          `Тарифы: [30, 90 и 180 дней](${FULL}/tarify.md)`,
          `Инструкции: [iOS](${FULL}/ios.md), [Android](${FULL}/android.md), [Windows](${FULL}/windows.md), [macOS](${FULL}/macos.md), [Linux](${FULL}/linux.md), [TV](${FULL}/tv.md), [роутер](${FULL}/router.md)`,
          '',
        ];
        for (const [file, title] of LLMS_PAGES) {
          try {
            const html = await readFile(path.join(dir.pathname, file), 'utf8');
            const md = htmlToMarkdown(html);
            if (!md) continue;
            // Markdown-версия страницы по тому же URL-пути (/ios/ -> /ios.md):
            // агенты читают их напрямую, как рекомендует спецификация llms.txt.
            const slug = file.replace(/index\.html$/, '').replace(/\/$/, '');
            const mdName = slug ? `${slug}.md` : 'index.md';
            await writeFile(
              path.join(dir.pathname, mdName),
              `# ${title}\n\n${md}\n`,
              'utf8'
            );
            chunks.push(
              `\n---\n\n## ${title}\n`,
              `Источник: [${title}](${FULL}/${mdName})\n`,
              md,
              ''
            );
          } catch {
            logger.warn(`llms-full: не удалось прочитать ${file}`);
          }
        }
        await writeFile(path.join(dir.pathname, 'llms-full.txt'), chunks.join('\n'), 'utf8');
        logger.info('llms-full.txt готов');
      },
    },
  };
}

export default defineConfig({
  output: 'static',
  site: SITE_ORIGIN,
  base: BASE,
  trailingSlash: 'always',
  // The whole site is one stylesheet (45KB raw / 9.5KB gzip). Inlining it
  // removes the render-blocking CSS round-trip: on a throttled mobile
  // connection the first paint moved ~250ms earlier. Small static site, so
  // the trade is clearly worth it.
  build: {
    inlineStylesheets: 'always',
  },
  // Sitemap URLs must match canonicals (guides use trailing slashes).
  // Source: @astrojs/sitemap v3 `serialize` (see node_modules/@astrojs/sitemap/dist/schema.js).
  integrations: [
    sitemap({
      // Text endpoints are not pages, /404 must never be indexed — keep them out.
      filter: (page) => !page.endsWith('.txt') && !page.includes('/404'),
      serialize: (item) => {
        const url = item.url.endsWith('/') ? item.url : `${item.url}/`;
        const { pathname } = new URL(url);
        return {
          ...item,
          url,
          lastmod: lastmodFor(pathname),
        };
      },
    }),
    llmsFullPlugin(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
