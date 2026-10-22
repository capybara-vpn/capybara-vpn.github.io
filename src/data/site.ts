/**
 * Single source of truth for the whole landing.
 * Change values here once — everything (CTA, pricing, SEO, JSON-LD, OG) updates.
 */

export const TELEGRAM_URL =
  'https://t.me/capybaravpnbot?start=partner_p1_RR66EINZM499Lk-RNN4';

export const BROWSER_URL =
  'https://capybara.black/partner/p1_RR66EINZM499Lk-RNN4';

// Public site origin + base. Production is the custom domain root.
// Change once before deploy.
// Local dev: http://localhost:4321
// Custom domain: https://capybaravpn.top (base '/')
// Overridable at build time via SITE_URL env (see .github/workflows/deploy.yml).
// biome-ignore lint: env access is intentional here
const ENV_SITE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.SITE_URL) ||
  (typeof process !== 'undefined' ? process.env?.SITE_URL : undefined);
export const SITE_URL = (ENV_SITE_URL || 'https://capybaravpn.top').replace(
  /\/$/,
  ''
);

// GA4 measurement id. Overridable at build time via the GA_ID repo variable
// (see .github/workflows/deploy.yml) so switching accounts never requires a
// code change. The literal below is the fallback for local builds.
const ENV_GA_ID = typeof process !== 'undefined' ? process.env?.GA_ID : undefined;
export const GA_ID = ENV_GA_ID || 'G-FHS5BR8L5J';

// Yandex Metrika counter id. Empty means "not configured": the loader is
// never injected and no request is made. Set the YM_ID repo variable to
// enable it.
const ENV_YM_ID = typeof process !== 'undefined' ? process.env?.YM_ID : undefined;
export const YM_ID = ENV_YM_ID || '';

export const site = {
  brand: 'Capybara VPN',
  lang: 'ru',
  siteUrl: SITE_URL,
  telegramUrl: TELEGRAM_URL,
  browserUrl: BROWSER_URL,
  gaId: GA_ID,
  ymId: YM_ID,
  themeColor: '#0b0e14',
  logo: {
    src: 'logo-320.png',
    alt: 'Capybara VPN — логотип капибары',
    width: 320,
    height: 320,
  },
  seo: {
    title: 'Capybara VPN — быстрый VPN от 249 ₽ для всех устройств',
    description:
      'VPN от 249 ₽, 1 день бесплатно. Capybara VPN: VLESS, 38 локаций, подключение за пару минут через Telegram или браузер.',
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
    per30Label: 'около 199 ₽ / 30 дней',
    savings: 299,
    featured: true,
  },
];

/**
 * Настоящие отзывы клиентов — источник для видимого блока на странице
 * тарифов и для разметки Review / AggregateRating.
 *
 * Пока список пуст, разметки отзывов на сайте нет вовсе: Google прямо
 * запрещает выдуманные отзывы и скрытые за вознаграждение, поэтому сюда
 * попадают только реальные мнения, опубликованные с согласия авторов.
 * Одно отключённое поле — и предупреждения Google уходят.
 */
export interface Review {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Дата отзыва в формате YYYY-MM-DD. */
  date: string;
  text: string;
}

export const reviews: Review[] = [];

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
  platforms: ['iOS', 'Android', 'Windows', 'macOS', 'Linux', 'TV', 'Роутер'] as const,
  support: 'Поддержка в Telegram',
} as const;

/** Single source of truth for the visible homepage FAQ *and* the FAQPage JSON-LD.
 * Edit answers here once — Faq.astro and BaseLayout stay in sync by construction. */
export const faqs = [
  {
    q: 'Что такое Capybara VPN?',
    a: 'Сервис для спокойного и быстрого доступа в интернет. Вы выбираете тариф, открываете Capybara VPN в Telegram или прямо в браузере и подключаетесь по короткой инструкции — без сложных настроек.',
  },
  {
    q: 'Это вообще законно?',
    a: 'Да. VPN легален: это технология шифрования трафика, которую используют банки, корпорации и обычные пользователи для защиты данных.',
  },
  {
    q: 'Сколько стоит подписка?',
    a: '30 дней — 249 ₽, 90 дней — 672 ₽ со скидкой 10% (экономия 75 ₽), 180 дней — 1195 ₽ со скидкой 20% (экономия 299 ₽). В пересчёте: 249 ₽, 224 ₽ и около 199 ₽ за 30 дней соответственно.',
  },
  {
    q: 'Есть ли пробный период?',
    a: 'Да. Первый день бесплатно, без привязки карты: вы получаете 10 ГБ трафика на тест. Выбираете устройство, подключаетесь за пару минут и проверяете скорость и стабильность на своём интернете. Понравилось — выбираете тариф.',
  },
  {
    q: 'Сколько устройств можно подключить?',
    a: 'В каждый тариф включено 1 устройство. Нужно больше — докупите дополнительные слоты за доплату прямо в сервисе: точная цена видна перед оплатой. Сервис работает на iOS, Android, Windows, macOS, Linux, TV и роутерах.',
  },
  {
    q: 'Точно ли не сохраняются логи?',
    a: 'Мы не храним историю посещений, IP-адреса и DNS-запросы. Серверы работают в режиме RAM-only без долговременных логов.',
  },
  {
    q: 'Какие платформы поддерживаются?',
    a: 'iOS, Android, Windows, macOS, Linux и TV. Интерфейс управления — Telegram-бот или браузерная версия, а подключение настраивается на вашем устройстве.',
  },
  {
    q: 'Что такое VLESS?',
    a: 'Современный протокол подключения, который использует Capybara VPN. На практике для вас это значит: быстрое соединение без ручной настройки конфигов — всё уже подготовлено в сервисе.',
  },
  {
    q: 'Работает ли при белых списках?',
    a: 'Да. Трафик Capybara VPN выглядит как обычный и проходит там, где действуют белые списки и ограничения. Если какая-то локация недоступна — напишите в поддержку, подскажут рабочую.',
  },
  {
    q: 'Есть ли ограничения по трафику?',
    a: 'Нет. Во всех тарифах (30, 90 и 180 дней) трафик безлимитный.',
  },
  {
    q: 'Как подключиться?',
    a: 'Три шага: выберите тариф, откройте Capybara VPN в Telegram или в браузере и следуйте короткой инструкции — выберите локацию и включите соединение. Обычно это занимает несколько минут.',
  },
  {
    q: 'Как оплатить из России?',
    a: 'Доступны популярные способы оплаты: карты, СБП и другие провайдеры, подключённые к сервису.',
  },
  {
    q: 'Что если не работает на каком-то сайте?',
    a: 'Напишите в поддержку — подскажем рабочую локацию или протокол. Обычно помогает смена сервера или обновление подписки.',
  },
  {
    q: 'Можно ли вернуть деньги?',
    a: 'Да, предусмотрен простой возврат в рамках правил сервиса. Обратитесь в поддержку с номером платежа.',
  },
  {
    q: 'Где доступна поддержка?',
    a: 'Поддержка работает через Telegram. Если что-то не подключается или есть вопрос по тарифу — напишите, помогут.',
  },
] as const;

export const nav = [
  { href: '/#pricing', label: 'Тарифы' },
  { href: '/#benefits', label: 'Возможности' },
  { href: '/#how', label: 'Как работает' },
  { href: '/#faq', label: 'FAQ' },
] as const;
