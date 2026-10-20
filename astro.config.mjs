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
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
