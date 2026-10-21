import { site, plans, facts } from '../data/site';

/**
 * /pricing.md — the same tariffs in a form an agent can parse without
 * rendering the page. AI assistants and buying agents skip a site whose
 * prices they cannot read, and they can read this.
 *
 * Format follows the convention for machine-readable pricing files: a
 * heading per tier, then explicit price, limits and features.
 */
const url = site.siteUrl;

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

export async function GET() {
  const tiers = plans.map((p) => {
    const per30 = p.per30Label.replace('≈', 'около ');
    const discount = p.discount > 0 ? ` (скидка ${p.discount}%, экономия ${fmt(p.savings)})` : '';
    return [
      `## ${p.days} дней — ${fmt(p.price)}`,
      '',
      `- Price: ${fmt(p.price)} за ${p.days} дней${discount}`,
      `- Equivalent per 30 days: ${per30}`,
      '- Limits: 1 device connected at a time; extra device slots are sold separately',
      '- Traffic: unlimited',
      `- Locations: ${facts.locations}, servers: ${facts.servers}, channel speed: up to ${facts.speed}`,
      '- Protocol: VLESS (pre-configured, no manual setup)',
      `- Platforms: ${[...facts.platforms].join(', ')}`,
      '',
    ];
  });

  const lines = [
    '# Pricing — Capybara VPN',
    '',
    'VPN-сервис с подпиской. Подключение через Telegram-бот или браузерную версию,',
    'настройка полностью автоматическая: вы выбираете устройство, получаете готовый',
    'профиль, выбираете локацию и включаете соединение.',
    '',
    '## Free',
    '- Price: 0 ₽ (первый день)',
    '- Limits: 10 ГБ трафика на тест, 1 устройство',
    '- Features: те же локации, серверы и протокол, что и в платных тарифах',
    '- Card required: no',
    '',
    '## Paid',
    '',
    ...tiers.flat(),
    '## Payment',
    '- Methods: банковские карты, СБП и другие подключённые провайдеры',
    '- Currency: RUB',
    '- Recurring: нет — подписка оплачивается на выбранный срок и продлевается вручную',
    '- Refunds: возврат предусмотрен в рамках правил сервиса, обратиться в поддержку с номером платежа',
    '',
    '## Support',
    '- Channel: Telegram, живые люди, отвечают по конкретной ситуации',
    '- Hours: ежедневно',
    '',
    '## Links',
    `- Официальный сайт: ${url}/`,
    `- Тарифы подробно: ${url}/tarify/`,
    `- Как оплатить: ${url}/oplata/`,
    `- Бесплатный день: ${url}/probny-den/`,
    `- Официальная страница сервиса: ${url}/official/`,
    `- Подключение в Telegram: ${site.telegramUrl}`,
    `- Подключение в браузере: ${site.browserUrl}`,
    '',
    `Last updated: ${new Date().toISOString().slice(0, 10)}`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
