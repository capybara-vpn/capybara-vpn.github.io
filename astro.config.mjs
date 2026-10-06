import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Deployment: single source is SITE_URL (origin + optional base path).
// Production is the GitHub user site at the root: SITE_URL=https://capybara-vpn.github.io
// (+ ASTRO_BASE=/, workflow sets both automatically via actions/configure-pages).
// Local default below matches the production root URL.
const FULL = (process.env.SITE_URL ?? 'https://capybara-vpn.github.io').replace(
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
