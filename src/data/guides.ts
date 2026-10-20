/**
 * Guide pages: one source for the related-links mesh, the footer nav and
 * the llms.txt list. `related` is explicit rather than positional — the
 * old slice(0, 4) always linked the same four pages, which left the
 * platform guides almost orphaned (1-2 inbound links each).
 */
export interface Guide {
  href: string;
  title: string;
  note: string;
  /** Short label for compact link lists. */
  short?: string;
  /** Paths of the pages this one should link to. */
  related: string[];
}

export const guides: Guide[] = [
  {
    href: '/chto-takoe-vpn/',
    title: 'Что такое VPN',
    note: 'простыми словами',
    related: ['/vless/', '/tarify/', '/probny-den/', '/ios/'],
  },
  {
    href: '/vless/',
    title: 'Что такое VLESS',
    note: 'протокол простыми словами',
    related: ['/chto-takoe-vpn/', '/tarify/', '/probny-den/', '/router/'],
  },
  {
    href: '/tarify/',
    title: 'Тарифы Capybara VPN',
    note: '30, 90 и 180 дней',
    related: ['/oplata/', '/probny-den/', '/chto-takoe-vpn/', '/router/'],
  },
  {
    href: '/probny-den/',
    title: 'Бесплатный день',
    note: '10 ГБ без карты',
    related: ['/ios/', '/android/', '/tarify/', '/oplata/'],
  },
  {
    href: '/oplata/',
    title: 'Как оплатить',
    note: 'карты, СБП, возврат',
    related: ['/tarify/', '/probny-den/', '/chto-takoe-vpn/', '/vless/'],
  },
  {
    href: '/ios/',
    title: 'Настройка на iOS',
    note: 'iPhone и iPad',
    short: 'iOS',
    related: ['/android/', '/macos/', '/probny-den/', '/chto-takoe-vpn/'],
  },
  {
    href: '/android/',
    title: 'Настройка на Android',
    note: 'смартфоны и планшеты',
    short: 'Android',
    related: ['/ios/', '/tv/', '/probny-den/', '/chto-takoe-vpn/'],
  },
  {
    href: '/windows/',
    title: 'Настройка на Windows',
    note: 'ПК и ноутбуки',
    short: 'Windows',
    related: ['/linux/', '/macos/', '/oplata/', '/chto-takoe-vpn/'],
  },
  {
    href: '/macos/',
    title: 'Настройка на macOS',
    note: 'MacBook и iMac',
    short: 'macOS',
    related: ['/ios/', '/windows/', '/probny-den/', '/chto-takoe-vpn/'],
  },
  {
    href: '/linux/',
    title: 'Настройка на Linux',
    note: 'Ubuntu, Debian и другие',
    short: 'Linux',
    related: ['/windows/', '/macos/', '/router/', '/chto-takoe-vpn/'],
  },
  {
    href: '/tv/',
    title: 'Настройка на TV',
    note: 'Smart TV и Android TV',
    short: 'TV',
    related: ['/android/', '/router/', '/oplata/', '/chto-takoe-vpn/'],
  },
  {
    href: '/router/',
    title: 'VPN на роутере',
    note: 'для всей домашней сети',
    short: 'роутер',
    related: ['/tv/', '/windows/', '/linux/', '/probny-den/'],
  },
];

/** Guide titles indexed by path — used by the OG image generator. */
export const guideByPath = Object.fromEntries(guides.map((g) => [g.href, g]));
