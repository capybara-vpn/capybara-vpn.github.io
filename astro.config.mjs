import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

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
      serialize: (item) => ({
        ...item,
        url: item.url.endsWith('/') ? item.url : `${item.url}/`,
      }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
