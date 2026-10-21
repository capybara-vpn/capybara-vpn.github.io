import { site } from '../data/site';

/**
 * Generated at build time so start_url/scope always point at the deployed
 * origin (SITE_URL) — a raw "." breaks as soon as the domain changes.
 */
export async function GET() {
  const manifest = {
    name: 'Capybara VPN',
    short_name: 'Capybara',
    description:
      'Capybara VPN — быстрый VPN от 249 ₽. Подключение через Telegram или браузер.',
    start_url: `${site.siteUrl}/`,
    scope: `${site.siteUrl}/`,
    display: 'standalone',
    background_color: '#0b0e14',
    theme_color: '#0b0e14',
    icons: [
      {
        src: `${site.siteUrl}/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${site.siteUrl}/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        // Separate artwork: the logo is inset with a solid background so any
        // Android launcher mask (circle, squircle, teardrop) cannot crop it.
        src: `${site.siteUrl}/icon-512-maskable.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
}
