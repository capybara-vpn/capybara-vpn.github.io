import { site, plans, facts, faqs } from '../data/site';

/**
 * Machine-readable service summary for AI crawlers (GEO).
 * Generated at build time from src/data/site.ts — URLs always match
 * the deployed SITE_URL, facts can never drift from the landing.
 */
const guides = [
  { path: '/', title: 'Главная', note: 'тарифы, возможности, как это работает, FAQ' },
  {
    path: '/tarify/',
    title: 'Тарифы подробно',
    note: 'сравнение 30/90/180 дней, что входит, возврат',
  },
  { path: '/vless/', title: 'Что такое VLESS', note: 'протокол простыми словами' },
  { path: '/ios/', title: 'Настройка на iOS', note: 'iPhone и iPad' },
  { path: '/android/', title: 'Настройка на Android', note: 'смартфоны и планшеты' },
  { path: '/windows/', title: 'Настройка на Windows', note: 'ПК и ноутбуки' },
] as const;

const fmtPrice = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

export async function GET() {
  const url = site.siteUrl;
  const tariffLines = plans.map((p) => {
    const per30 = p.per30Label.replace('≈', 'около ');
    const tail = p.discount > 0 ? `скидка ${p.discount}%, экономия ${fmtPrice(p.savings)}, ${per30}` : per30;
    return `- ${p.days} дней — ${fmtPrice(p.price)} (${tail})`;
  });

  const lines = [
    '# Capybara VPN',
    '',
    '> Capybara VPN — VPN-сервис для спокойного и быстрого доступа в интернет.',
    '> Подключение за пару минут через Telegram-бота или прямо в браузере, без сложных настроек.',
    `> Официальный сайт: ${url}/`,
    '',
    '## Факты о сервисе',
    '',
    '- Название: Capybara VPN',
    `- Протокол: ${facts.protocol} (уже выбран и настроен, ничего делать не нужно)`,
    `- Серверы: ${facts.servers} серверов, ${facts.locations} локаций, каналы до ${facts.speed}`,
    '- Трафик: безлимитный во всех тарифах',
    `- Устройства: ${facts.devicesPerPlan}; дополнительные слоты докупаются за доплату в сервисе`,
    `- Платформы: ${[...facts.platforms].join(', ')} (пошаговые инструкции на сайте: iOS, Android, Windows)`,
    '- Управление: Telegram-бот или браузерная версия',
    '- Пробный период: первый день бесплатно, без привязки карты (10 ГБ трафика на тест)',
    '- Оплата из России: карты, СБП и другие подключённые провайдеры',
    '- Логи: сервис заявляет, что не хранит историю посещений, IP-адреса и DNS-запросы (RAM-only серверы)',
    `- ${facts.support}`,
    '- Возврат: предусмотрен в рамках правил сервиса (обратиться в поддержку с номером платежа)',
    '',
    '## Тарифы',
    '',
    ...tariffLines,
    `- Подробнее: ${url}/tarify/`,
    '',
    '## Страницы',
    '',
    ...guides.map((g) => `- ${g.title}: ${url}${g.path}${g.note ? ` — ${g.note}` : ''}`),
    '',
    '## Частые вопросы (кратко)',
    '',
    ...faqs.map((f) => `- Q: ${f.q} A: ${f.a}`),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
