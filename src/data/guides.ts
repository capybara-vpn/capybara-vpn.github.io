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
  /** Column in the footer navigation. */
  group: 'основы' | 'установка' | 'сервис' | 'сценарии';
}

export const guides: Guide[] = [
  {
    href: '/official/',
    title: 'Официальный сайт',
    note: 'факты, тарифы, как отличить от подделок',
    group: 'сервис',
    related: ['/tarify/', '/oplata/', '/fakty/', '/kak-vybrat-vpn/'],
  },
  {
    href: '/belye-spiski/',
    title: 'Белые списки операторов',
    note: 'что это и как проверить фильтрацию',
    group: 'основы',
    related: ['/ne-rabotaet/', '/kak-vybrat-lokaciyu/', '/vpn-dlya-youtube/', '/chto-takoe-vpn/'],
  },
  {
    href: '/vpn-dlya-youtube/',
    title: 'VPN для YouTube',
    note: 'как смотреть видео плавно',
    group: 'основы',
    related: ['/kak-vybrat-lokaciyu/', '/proverka-skorosti/', '/vpn-dlya-instagram/', '/ne-rabotaet/'],
  },
  {
    href: '/chto-takoe-vpn/',
    title: 'Что такое VPN',
    note: 'простыми словами',
    group: 'основы',
    related: ['/vless/', '/bezopasnost-vpn/', '/kak-vybrat-vpn/', '/neskolko-ustroystv/'],
  },
  {
    href: '/vless/',
    title: 'Что такое VLESS',
    note: 'протокол простыми словами',
    group: 'основы',
    related: ['/chto-takoe-vpn/', '/bezopasnost-vpn/', '/android/', '/windows/'],
  },
  {
    href: '/bezopasnost-vpn/',
    title: 'Безопасность и приватность',
    note: 'что VPN защищает, а что нет',
    group: 'основы',
    related: ['/chto-takoe-vpn/', '/vless/', '/vpn-bez-registracii/', '/macos/'],
  },
  {
    href: '/kak-vybrat-lokaciyu/',
    title: 'Как выбрать локацию',
    note: '38 вариантов и что на них влияет',
    group: 'основы',
    related: ['/proverka-skorosti/', '/ne-rabotaet/', '/vpn-dlya-igr/', '/dlya-novichkov/'],
  },
  {
    href: '/proverka-skorosti/',
    title: 'Как проверить скорость',
    note: 'замер на своих устройствах',
    group: 'основы',
    related: ['/kak-vybrat-lokaciyu/', '/ne-rabotaet/', '/vpn-dlya-igr/', '/probny-den/'],
  },
  {
    href: '/dlya-novichkov/',
    title: 'Первый раз с VPN',
    note: 'от тарифа до первого соединения',
    group: 'основы',
    related: ['/telegram-ili-brauzer/', '/ne-rabotaet/', '/kak-vklyuchit-vpn-na-telefone/', '/bezopasnost-vpn/'],
  },
  {
    href: '/ne-rabotaet/',
    title: 'Если не работает',
    note: '7 шагов разбора',
    group: 'основы',
    related: ['/proverka-skorosti/', '/kak-vybrat-lokaciyu/', '/vpn-dlya-windows-11/', '/dlya-novichkov/'],
  },
  {
    href: '/tarify/',
    title: 'Тарифы подробно',
    note: '30, 90 и 180 дней',
    group: 'сервис',
    related: ['/oplata/', '/neskolko-ustroystv/', '/kak-vybrat-vpn/', '/ne-rabotaet/'],
  },
  {
    href: '/probny-den/',
    title: 'Бесплатный день',
    note: '10 ГБ без карты',
    group: 'сервис',
    related: ['/ios/', '/android/', '/proverka-skorosti/', '/besplatny-vpn/'],
  },
  {
    href: '/oplata/',
    title: 'Как оплатить',
    note: 'карты, СБП, возврат',
    group: 'сервис',
    related: ['/tarify/', '/neskolko-ustroystv/', '/telegram-ili-brauzer/', '/vless/'],
  },
  {
    href: '/neskolko-ustroystv/',
    title: 'Несколько устройств',
    note: 'слоты и схема с роутером',
    group: 'сервис',
    related: ['/router/', '/tarify/', '/vpn-dlya-raboty/', '/oplata/'],
  },
  {
    href: '/telegram-ili-brauzer/',
    title: 'Telegram или браузер',
    note: 'два входа в один сервис',
    group: 'сервис',
    related: ['/oplata/', '/ios/', '/vpn-bez-registracii/', '/bezopasnost-vpn/'],
  },
  {
    href: '/ios/',
    title: 'Настройка на iOS',
    note: 'iPhone и iPad',
    short: 'iOS',
    group: 'установка',
    related: ['/android/', '/kak-vklyuchit-vpn-na-telefone/', '/probny-den/', '/telegram-ili-brauzer/'],
  },
  {
    href: '/android/',
    title: 'Настройка на Android',
    note: 'смартфоны и планшеты',
    short: 'Android',
    group: 'установка',
    related: ['/ios/', '/kak-vklyuchit-vpn-na-telefone/', '/probny-den/', '/telegram-ili-brauzer/'],
  },
  {
    href: '/windows/',
    title: 'Настройка на Windows',
    note: 'ПК и ноутбуки',
    short: 'Windows',
    group: 'установка',
    related: ['/linux/', '/macos/', '/vpn-dlya-windows-11/', '/chto-takoe-vpn/'],
  },
  {
    href: '/macos/',
    title: 'Настройка на macOS',
    note: 'MacBook и iMac',
    short: 'macOS',
    group: 'установка',
    related: ['/ios/', '/windows/', '/linux/', '/probny-den/'],
  },
  {
    href: '/linux/',
    title: 'Настройка на Linux',
    note: 'Ubuntu, Debian и другие',
    short: 'Linux',
    group: 'установка',
    related: ['/windows/', '/macos/', '/router/', '/chto-takoe-vpn/'],
  },
  {
    href: '/tv/',
    title: 'Настройка на TV',
    note: 'Smart TV и Android TV',
    short: 'TV',
    group: 'установка',
    related: ['/android/', '/router/', '/tarify/', '/kak-vybrat-lokaciyu/'],
  },
  {
    href: '/router/',
    title: 'VPN на роутере',
    note: 'для всей домашней сети',
    short: 'роутер',
    group: 'установка',
    related: ['/tv/', '/windows/', '/linux/', '/neskolko-ustroystv/'],
  },  {
    href: '/vpn-dlya-instagram/',
    title: 'VPN для Instagram',
    note: 'как вернуть доступ к профилю и Reels',
    group: 'сценарии',
    related: ['/vpn-dlya-youtube/', '/kak-vybrat-lokaciyu/', '/besplatny-vpn/', '/bezopasnost-vpn/'],
  },
  {
    href: '/vpn-dlya-raboty/',
    title: 'VPN для работы',
    note: 'почта, CRM и видеозвонки',
    group: 'сценарии',
    related: ['/neskolko-ustroystv/', '/kak-vybrat-lokaciyu/', '/vpn-dlya-igr/', '/proverka-skorosti/'],
  },
  {
    href: '/vpn-dlya-igr/',
    title: 'VPN для игр',
    note: 'пинг, лаги и игровые серверы',
    group: 'сценарии',
    related: ['/kak-vybrat-lokaciyu/', '/proverka-skorosti/', '/vpn-dlya-raboty/', '/ne-rabotaet/'],
  },
  {
    href: '/kak-vybrat-vpn/',
    title: 'Как выбрать VPN',
    note: '7 критериев и красные флаги',
    group: 'сценарии',
    related: ['/tarify/', '/kak-vybrat-lokaciyu/', '/vpn-dlya-raboty/', '/besplatny-vpn/'],
  },
  {
    href: '/sravnenie/',
    title: 'Сравнение VPN-сервисов',
    note: 'пять сервисов по одинаковым критериям',
    group: 'сервис',
    related: ['/kak-vybrat-vpn/', '/tarify/', '/besplatny-vpn/', '/fakty/', '/official/'],
  },
  {
    href: '/fakty/',
    title: 'Факты в цифрах',
    note: 'все числа сервиса на одной странице',
    group: 'основы',
    related: ['/tarify/', '/official/', '/proverka-skorosti/', '/kak-vybrat-vpn/'],
  },
  {
    href: '/besplatny-vpn/',
    title: 'Бесплатный VPN',
    note: 'за что платят и что бывает бесплатно',
    group: 'сервис',
    related: ['/probny-den/', '/bezopasnost-vpn/', '/vpn-bez-registracii/', '/sravnenie/'],
  },
  {
    href: '/vpn-bez-registracii/',
    title: 'VPN без регистрации',
    note: 'без почты, телефона и карты',
    group: 'сервис',
    related: ['/telegram-ili-brauzer/', '/probny-den/', '/besplatny-vpn/', '/bezopasnost-vpn/'],
  },
  {
    href: '/kak-vklyuchit-vpn-na-telefone/',
    title: 'VPN на телефоне',
    note: 'iPhone и Android за 5 минут',
    group: 'установка',
    related: ['/ios/', '/android/', '/dlya-novichkov/', '/probny-den/'],
  },
  {
    href: '/vpn-dlya-windows-11/',
    title: 'VPN на Windows 11',
    note: 'подключение за пару минут',
    group: 'установка',
    related: ['/windows/', '/linux/', '/macos/', '/ne-rabotaet/'],
  },
];

/** Guide titles indexed by path — used by the OG image generator. */
export const guideByPath = Object.fromEntries(guides.map((g) => [g.href, g]));
