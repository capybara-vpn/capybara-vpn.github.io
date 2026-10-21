/**
 * Lightweight client behaviour: header, reveals, analytics (consent-aware),
 * mobile CTA visibility, cursor glow, FAQ tracking.
 * No framework, no animation libraries: entrance motion is CSS + IntersectionObserver.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function track(name: string, params: Record<string, string> = {}) {
  try {
    if (typeof (window as unknown as { gtag?: unknown }).gtag === 'function') {
      (window as unknown as { gtag: (...a: unknown[]) => void }).gtag('event', name, params);
    }
  } catch {
    /* noop */
  }
}

/** Same events for Yandex Metrika (no-op until the counter is loaded). */
function trackYm(name: string, params: Record<string, string> = {}) {
  try {
    const ym = (window as unknown as { ym?: (...a: unknown[]) => void }).ym;
    const id = document.documentElement.dataset.ymId;
    if (typeof ym === 'function' && id) ym(id, 'event', name, params);
  } catch {
    /* noop */
  }
}

/* ---------- header ---------- */
const header = document.getElementById('site-header');
const onScrollHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
};
onScrollHeader();
{
  // rAF-throttled: at most one header update per frame.
  let headerRaf = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (headerRaf) return;
      headerRaf = requestAnimationFrame(() => {
        headerRaf = 0;
        onScrollHeader();
      });
    },
    { passive: true }
  );
}

/* ---------- reveal on scroll ---------- */
const revealEls = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
if ('IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
  // Failsafe: if the observer never fires (slow script, odd viewport), the
  // content on screen must not stay invisible. Only what is already in view
  // is revealed, so the scroll effect below the fold is preserved.
  window.setTimeout(() => {
    revealEls.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.2) {
        el.classList.add('is-visible');
      }
    });
  }, 3000);
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- animated price numbers (subtle count-up, once) ---------- */
{
  const nums = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!reduced && 'IntersectionObserver' in window) {
    const nio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          nio.unobserve(el);
          const target = Number(el.dataset.count || '0');
          const t0 = performance.now();
          const dur = 900;
          const step = (t: number) => {
            const k = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - k, 3);
            el.textContent = `${Math.round(target * eased).toLocaleString('ru-RU')} ₽`;
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );
    nums.forEach((n) => nio.observe(n));
  }
}

/* ---------- CTA click tracking (never blocks navigation) ---------- */
document.querySelectorAll<HTMLAnchorElement>('a[data-cta]').forEach((a) => {
  a.addEventListener('click', () => {
    track('cta_click', {
      placement: a.dataset.placement || 'unknown',
      destination: a.dataset.destination || 'unknown',
      ...(a.dataset.tariff ? { tariff: a.dataset.tariff } : {}),
    });
    // alias events required by spec
    const alias = `${a.dataset.placement || 'x'}_${a.dataset.destination || 'y'}_click`;
    track(alias, { ...(a.dataset.tariff ? { tariff: a.dataset.tariff as string } : {}) });
    trackYm('cta_click', {
      placement: a.dataset.placement || 'unknown',
      destination: a.dataset.destination || 'unknown',
      ...(a.dataset.tariff ? { tariff: a.dataset.tariff } : {}),
    });
  });
});

/* ---------- FAQ open tracking ---------- */
document.querySelectorAll<HTMLDetailsElement>('details.faq').forEach((d) => {
  d.addEventListener('toggle', () => {
    if (d.open) {
      const q = d.querySelector('summary')?.textContent?.trim().slice(0, 80) || 'faq';
      track('faq_open', { question: q });
    }
  });
});

/* ---------- scroll depth ---------- */
const depths = [25, 50, 75, 90];
const fired = new Set<number>();
const onScrollDepth = () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  if (max <= 0) return;
  const pct = (window.scrollY / max) * 100;
  for (const d of depths) {
    if (pct >= d && !fired.has(d)) {
      fired.add(d);
      track('scroll_depth', { depth: `${d}` });
      track(`scroll_${d}`, {});
    }
  }
};
let depthRaf = 0;
window.addEventListener(
  'scroll',
  () => {
    if (depthRaf) return;
    depthRaf = requestAnimationFrame(() => {
      depthRaf = 0;
      onScrollDepth();
    });
  },
  { passive: true }
);

/* ---------- mobile sticky CTA visibility ---------- */
const mobileCta = document.getElementById('mobile-cta');
const finalCta = document.getElementById('final');
if (mobileCta && 'IntersectionObserver' in window) {
  const hideForFinal = new IntersectionObserver(
    (entries) => {
      const visible = entries[0]?.isIntersecting;
      mobileCta.classList.toggle('is-hidden', !!visible);
    },
    { threshold: 0.15 }
  );
  if (finalCta) hideForFinal.observe(finalCta);
}

/* ---------- cursor-follow ambient glow (desktop, fine pointer only) ---------- */
const glow = document.getElementById('cursor-glow');
if (glow && !reduced && window.matchMedia('(pointer: fine)').matches) {
  let raf = 0;
  let x = -600;
  let y = -600;
  window.addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          glow.style.opacity = '1';
          glow.style.transform = `translate(${x - 260}px, ${y - 260}px)`;
          raf = 0;
        });
      }
    },
    { passive: true }
  );
}

/* ---------- consent + GA4 lazy load (library only after consent) ---------- */
const CONSENT_KEY = 'capybara-consent-v1';
const CONSENT_TTL_MS = 180 * 24 * 60 * 60 * 1000; // re-ask twice a year
const banner = document.getElementById('consent');
let gaConfigured = false;

function loadGtag(id: string) {
  if (document.querySelector('script[data-gtag]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.dataset.gtag = '1';
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  s.onload = () => {
    try {
      // gtag('js', ...) is already sent by the inline snippet in the head.
      const gtag = (window as unknown as { gtag: (...a: unknown[]) => void }).gtag;
      gtag('config', id);
    } catch {
      /* noop */
    }
  };
  document.head.appendChild(s);
}

function configureGA(id: string) {
  if (gaConfigured || !id || id.includes('XXXX')) return;
  gaConfigured = true;
  loadGtag(id);
}

/* ---------- Yandex Metrika (same consent gate as GA4) ---------- */
function loadMetrika(id: string) {
  if (!id || document.querySelector('script[data-ym]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.dataset.ym = '1';
  s.src = 'https://mc.yandex.ru/metrika/tag.js';
  s.onload = () => {
    try {
      const ym = (window as unknown as { ym?: (...a: unknown[]) => void }).ym;
      ym?.(id, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      });
    } catch {
      /* noop */
    }
  };
  document.head.appendChild(s);
}

function applyConsent(value: 'granted' | 'denied') {
  try {
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag('consent', 'update', {
      analytics_storage: value,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  } catch {
    /* noop */
  }
  if (value === 'granted') {
    const id =
      document.documentElement.dataset.gaId ||
      (document.getElementById('ga-id')?.textContent?.trim() ?? '');
    if (id) configureGA(id);
    const ymId = document.documentElement.dataset.ymId || '';
    if (ymId) loadMetrika(ymId);
  }
}

function readStoredConsent(): 'granted' | 'denied' | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (raw === 'granted' || raw === 'denied') return raw; // legacy plain values
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v?: unknown; ts?: unknown };
    if ((parsed.v === 'granted' || parsed.v === 'denied') && typeof parsed.ts === 'number') {
      if (Date.now() - parsed.ts < CONSENT_TTL_MS) return parsed.v;
      localStorage.removeItem(CONSENT_KEY); // expired — ask again
    }
    return null;
  } catch {
    return null;
  }
}

function writeStoredConsent(value: 'granted' | 'denied') {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ v: value, ts: Date.now() }));
  } catch {
    /* noop */
  }
}

const stored = readStoredConsent();

/**
 * Show or hide the consent bar.
 * The bar is a non-modal region: it never traps focus, so the page stays
 * fully usable while the choice is pending.
 */
function setBannerVisible(visible: boolean) {
  banner?.classList.toggle('hidden', !visible);
  // The mobile sticky CTA and the consent bar would fight for the same
  // bottom strip of the screen, so the sticky bar steps aside while the
  // choice is pending.
  document.documentElement.classList.toggle('has-consent', visible);
  // The "Cookie" pill only makes sense once a choice has been made.
  document.getElementById('consent-manage-wrap')?.classList.toggle('hidden', visible);
}

function declineConsent(event: string) {
  writeStoredConsent('denied');
  applyConsent('denied');
  setBannerVisible(false);
  returnFocusToManage();
  track(event, {});
}

if (stored === 'granted' || stored === 'denied') {
  setBannerVisible(false);
  applyConsent(stored);
} else {
  setBannerVisible(true);
}

document.getElementById('consent-accept')?.addEventListener('click', () => {
  writeStoredConsent('granted');
  applyConsent('granted');
  setBannerVisible(false);
  returnFocusToManage();
  track('consent_granted', {});
});
document.getElementById('consent-decline')?.addEventListener('click', () => {
  declineConsent('consent_declined');
});
// Keyboard users must be able to dismiss the banner: Esc = decline.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && banner && !banner.classList.contains('hidden')) {
    declineConsent('consent_escape');
  }
});
// Tapping the page itself dismisses the bar as "not now" — the choice stays
// available through the Cookie pill.
document.addEventListener(
  'click',
  (e) => {
    if (!banner || banner.classList.contains('hidden')) return;
    const t = e.target as Node | null;
    if (!t || banner.contains(t)) return;
    if (document.getElementById('consent-manage')?.contains(t)) return;
    declineConsent('consent_dismissed');
  },
  true
);

function returnFocusToManage() {
  document.getElementById('consent-manage')?.focus();
}
document.getElementById('consent-manage')?.addEventListener('click', () => {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* noop */
  }
  setBannerVisible(true);
  // Keep the keyboard where the user is: the first control of the bar.
  document.getElementById('consent-accept')?.focus();
});

export {};
