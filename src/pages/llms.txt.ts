import { site, plans, facts, faqs } from '../data/site';
import { guides } from '../data/guides';

/**
 * Machine-readable service summary for AI crawlers (GEO).
 * Generated at build time from src/data/site.ts — URLs always match
 * the deployed SITE_URL, facts can never drift from the landing.
 */
const guideNotes: Record<string, string> = {
  '/tarify/': 'сравнение 30/90/180 дней, что входит, возврат',
  '/vless/': 'протокол простыми словами',
  '/chto-takoe-vpn/': 'как работает и что меняется',
  '/bezopasnost-vpn/': 'что VPN защищает, а что нет',
  '/kak-vybrat-lokaciyu/': '38 локаций и что на них влияет',
  '/proverka-skorosti/': 'как мерить скорость честно',
  '/dlya-novichkov/': 'первый раз: от тарифа до соединения',
  '/ne-rabotaet/': '7 шагов, если не подключается',
  '/probny-den/': '10 ГБ трафика на тест, карта не нужна',
  '/oplata/': 'карты, СБП, возврат',
  '/neskolko-ustroystv/': 'слоты и схема с роутером',
  '/telegram-ili-brauzer/': 'два входа в один сервис',
  '/ios/': 'iPhone и iPad',
  '/android/': 'смартфоны и планшеты',
  '/windows/': 'ПК и ноутбуки',
  '/macos/': 'MacBook и iMac',
  '/linux/': 'Ubuntu, Debian и другие',
  '/tv/': 'Smart TV и Android TV',
  '/router/': 'одна настройка для всей сети',
};

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
    `> Полный текст сайта одним файлом: ${url}/llms-full.txt`,
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
    '- Главная: тарифы, возможности, как это работает, FAQ',
    ...guides.map((g) => `- ${g.title}: ${url}${g.href}${guideNotes[g.href] ? ` — ${guideNotes[g.href]}` : ''}`),
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
