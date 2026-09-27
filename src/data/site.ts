/**
 * Single source of truth for the whole landing.
 * Change values here once — everything (CTA, pricing, SEO, JSON-LD, OG) updates.
 */

export const TELEGRAM_URL =
  'https://t.me/capybaravpnbot?start=partner_p1_RR66EINZM499Lk-RNN4';

export const BROWSER_URL =
  'https://capybaravpn.app/partner/p1_RR66EINZM499Lk-RNN4';

// Public site origin + base. Change once before deploy.
// Local dev: http://localhost:4321
// GitHub Pages project: https://<username>.github.io/<repo>
// Custom domain: https://your-domain.com
// Overridable at build time via SITE_URL env (see .github/workflows/deploy.yml).
// biome-ignore lint: env access is intentional here
const ENV_SITE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.SITE_URL) ||
  (typeof process !== 'undefined' ? process.env?.SITE_URL : undefined);
export const SITE_URL = (ENV_SITE_URL || 'https://capybara-vpn.github.io/capybara-landing').replace(
  /\/$/,
  ''
);

// Astro base is configured in astro.config.mjs via ASTRO_BASE env.
// Keep in sync for canonical / sitemap / OG absolute URLs.
export const SITE_BASE = '/';

export const GA_ID = 'G-FHS5BR8L5J';

export const site = {
  brand: 'Capybara VPN',
  shortName: 'Capybara',
  lang: 'ru',
  siteUrl: SITE_URL,
  telegramUrl: TELEGRAM_URL,
  browserUrl: BROWSER_URL,
  gaId: GA_ID,
  themeColor: '#0b0e14',
  logo: {
    src: 'logo.png',
    alt: 'Capybara VPN — логотип капибары',
    width: 640,
    height: 640,
  },
  seo: {
    title: 'Capybara VPN — быстрый VPN от 249 ₽ | Telegram и браузер',
    description:
      'Capybara VPN — спокойный и быстрый VPN с подпиской от 249 ₽. Подключение за пару минут через Telegram или прямо в браузере. VLESS, 38 локаций, 100+ серверов, каналы до 10 Гбит/с.',
    keywords: [
      'Capybara VPN',
      'VPN Capybara',
      'купить VPN',
      'VPN подписка',
      'быстрый VPN',
      'VPN для телефона',
      'VPN Telegram',
      'VPN в браузере',
      'VLESS VPN',
    ],
  },
} as const;

export interface Plan {
  id: '30d' | '90d' | '180d';
  days: 30 | 90 | 180;
  price: number;
  discount: 0 | 10 | 20;
  devices: 1;
  traffic: string;
  per30: number;
  per30Label: string;
  savings: number;
  featured?: boolean;
}

export const plans: Plan[] = [
  {
    id: '30d',
    days: 30,
    price: 249,
    discount: 0,
    devices: 1,
    traffic: 'Безлим',
    per30: 249,
    per30Label: '249 ₽ / 30 дней',
    savings: 0,
  },
  {
    id: '90d',
    days: 90,
    price: 672,
    discount: 10,
    devices: 1,
    traffic: 'Безлим',
    per30: 224,
    per30Label: '224 ₽ / 30 дней',
    savings: 75,
  },
  {
    id: '180d',
    days: 180,
    price: 1195,
    discount: 20,
    devices: 1,
    traffic: 'Безлим',
    per30: 199,
    per30Label: '≈199 ₽ / 30 дней',
    savings: 299,
    featured: true,
  },
];

/** Only numbers that are treated as confirmed product facts. */
export const facts = {
  protocol: 'VLESS',
  locations: 38,
  locationsLabel: '38 локаций',
  servers: '100+',
  serversLabel: '100+ серверов',
  speed: '10 Гбит/с',
  speedNote: 'каналы до 10 Гбит/с',
  traffic: 'Безлим',
  devicesPerPlan: '1 устройство / тариф',
  platforms: ['iOS', 'Android', 'Windows', 'macOS', 'Linux', 'TV'] as const,
  support: 'Поддержка в Telegram',
} as const;

export const nav = [
  { href: '#pricing', label: 'Тарифы' },
  { href: '#benefits', label: 'Возможности' },
  { href: '#how', label: 'Как это работает' },
  { href: '#faq', label: 'FAQ' },
] as const;
