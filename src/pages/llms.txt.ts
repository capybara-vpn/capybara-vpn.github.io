import { site, plans, facts, faqs } from '../data/site';
import { guides } from '../data/guides';

/**
 * Machine-readable service summary for AI crawlers (GEO).
 *
 * Built to the llms.txt v2 spec (llmstxt.org): H1 with the site name, a
 * blockquote summary, an optional details block, and then H2 sections that
 * are "file lists" — every item is a markdown hyperlink with an optional
 * note. The links point at the .md version of each page, which the spec
 * recommends for agent-friendly content.
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
  '/official/': 'официальный сайт: факты, тарифы, как отличить от подделок',
  '/belye-spiski/': 'белые списки операторов: что это и как проверить',
  '/vpn-dlya-youtube/': 'как смотреть YouTube плавно',
  '/vpn-dlya-instagram/': 'как вернуть доступ к профилю и Reels',
  '/vpn-dlya-raboty/': 'почта, CRM и видеозвонки: когда VPN нужен на работе',
  '/vpn-dlya-igr/': 'пинг, лаги и игровые серверы',
  '/kak-vybrat-vpn/': '7 критериев выбора и красные флаги',
  '/sravnenie/': 'пять VPN-сервисов по одинаковым критериям: цена, устройства, локации, логи',
  '/fakty/': 'все цифры сервиса в одной таблице с датой проверки',
  '/besplatny-vpn/': 'за что платят бесплатные сервисы и что можно получить бесплатно',
  '/vpn-bez-registracii/': 'вход без почты, телефона и карты',
  '/kak-vklyuchit-vpn-na-telefone/': 'iPhone и Android за 5 минут',
  '/vpn-dlya-windows-11/': 'подключение на Windows 11',
};

const fmtPrice = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

/** Markdown version of a page: /ios/ -> /ios.md, / -> /index.md */
const mdUrl = (path: string) =>
  `${site.siteUrl}${path === '/' ? '/index.md' : `${path.replace(/\/$/, '')}.md`}`;

export async function GET() {
  const url = site.siteUrl;

  const tariffLines = plans.map((p) => {
    const per30 = p.per30Label.replace('≈', 'около ');
    const tail = p.discount > 0 ? `скидка ${p.discount}%, экономия ${fmtPrice(p.savings)}, ${per30}` : per30;
    return `- [${p.days} дней — ${fmtPrice(p.price)}](${mdUrl('/tarify/')}): ${tail}, безлимитный трафик, 1 устройство`;
  });

  const lines = [
    '# Capybara VPN',
    '',
    '> Capybara VPN — VPN-сервис для спокойного и быстрого доступа в интернет. Подключение за пару минут через Telegram-бота или прямо в браузере, без сложных настроек.',
    '',
    `Capybara VPN — VPN-сервис: протокол ${facts.protocol}, ${facts.locations} локаций, ${facts.servers} серверов, каналы до ${facts.speed}. Трафик безлимитный во всех тарифах, ${facts.devicesPerPlan} (дополнительные слоты докупаются за доплату в сервисе). Тарифы: 30 дней — 249 ₽, 90 дней — 672 ₽, 180 дней — 1195 ₽. Пробный период: первый день бесплатно, 10 ГБ трафика, карта не нужна. Оплата из России: карты, СБП и другие провайдеры. Управление — Telegram-бот или браузерная версия. Сервис заявляет, что не хранит историю посещений, IP-адреса и DNS-запросы (серверы работают в режиме RAM-only). ${facts.support}. Возврат предусмотрен в рамках правил сервиса — обратитесь в поддержку с номером платежа.`,
    '',
    '## Страницы',
    '',
    `- [Главная](${mdUrl('/')}): тарифы, возможности, как это работает, FAQ`,
    ...guides.map(
      (g) => `- [${g.title}](${mdUrl(g.href)})${guideNotes[g.href] ? `: ${guideNotes[g.href]}` : ''}`
    ),
    '',
    '## Тарифы',
    '',
    ...tariffLines,
    '',
    '## Частые вопросы',
    '',
    ...faqs.map((f) => `- [${f.q}](${mdUrl('/')}): ${f.a}`),
    '',
    '## Служебные файлы',
    '',
    `- [Полный текст сайта](${url}/llms-full.txt): весь сайт одним markdown-файлом`,
    `- [Карта сайта](${url}/sitemap-index.xml): все страницы с датами изменения`,
    `- [Прайс для агентов](${url}/pricing.md): тарифы в machine-readable формате`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
