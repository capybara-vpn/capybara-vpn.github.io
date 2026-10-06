import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Deployment: single source is SITE_URL (origin + optional base path).
// - Project site:  SITE_URL=https://<user>.github.io/<repo>   (+ ASTRO_BASE=/<repo>/,
//                   workflow sets both automatically via actions/configure-pages)
// - Custom domain: SITE_URL=https://your-domain.com            (+ ASTRO_BASE=/)
// - Local default below matches the placeholder production URL.
const FULL = (process.env.SITE_URL ?? 'https://capybara-vpn.github.io/capybara-landing').replace(
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
  trailingSlash: 'never',
  // Sitemap URLs must match canonicals (guides use trailing slashes).
  // Source: @astrojs/sitemap v3 `serialize` (see node_modules/@astrojs/sitemap/dist/schema.js).
  integrations: [
    sitemap({
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
