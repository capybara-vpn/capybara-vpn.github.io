import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { lastCommitISO, pageSource } from './src/lib/dates.ts';

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
 * The date comes from the same helper the pages use for their visible
 * "Обновлено" line (src/lib/dates.ts), so the two can never drift apart.
 */
function lastmodFor(pathname) {
  const file = pageSource(pathname);
  if (!file) return undefined;
  return lastCommitISO(file);
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
  ['official/index.html', 'Официальный сайт'],
  ['belye-spiski/index.html', 'Белые списки операторов'],
  ['vpn-dlya-youtube/index.html', 'VPN для YouTube'],
  ['vpn-dlya-instagram/index.html', 'VPN для Instagram'],
  ['vpn-dlya-raboty/index.html', 'VPN для работы'],
  ['vpn-dlya-igr/index.html', 'VPN для игр'],
  ['kak-vybrat-vpn/index.html', 'Как выбрать VPN'],
  ['besplatny-vpn/index.html', 'Бесплатный VPN'],
  ['sravnenie/index.html', 'Сравнение VPN-сервисов'],
  ['fakty/index.html', 'Capybara VPN в цифрах'],
  ['vpn-bez-registracii/index.html', 'VPN без регистрации'],
  ['kak-vklyuchit-vpn-na-telefone/index.html', 'VPN на телефоне'],
  ['vpn-dlya-windows-11/index.html', 'VPN на Windows 11'],
];

/**
 * HTML tables -> Markdown tables.
 * Stripping the tags left rows without a header separator, so the table did
 * not render as a table at all — just loose lines with pipes in them.
 */
function tablesToMarkdown(html) {
  return html.replace(/<table\b[\s\S]*?<\/table>/gi, (table) => {
    const rows = [];
    for (const rowMatch of table.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)) {
      const cells = [...rowMatch[0].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(
        (cell) =>
          cell[1]
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\|/g, '\\|')
            .trim()
      );
      if (cells.length) rows.push(cells);
    }
    if (!rows.length) return '';
    const [head, ...body] = rows;
    const line = (row) => `| ${row.join(' | ')} |`;
    const separator = line(head.map(() => '---'));
    return `\n${[line(head), separator, ...body.map(line)].join('\n')}\n`;
  });
}

function htmlToMarkdown(html) {
  // Only the page content: the header, footer, sticky CTA and consent bar
  // are navigation chrome and would only dilute the text for a model.
  const main = html.match(/<main\b[\s\S]*?<\/main>/i);
  const body = main ? main[0] : html;
  const cleaned = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '');
  return tablesToMarkdown(cleaned)
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    // Links keep their target: an agent that reads the .md copy still sees
    // where a button actually leads.
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, '`$2`')
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
      filter: (page) => !page.endsWith('.txt') && !page.endsWith('.md') && !page.includes('/404'),
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
