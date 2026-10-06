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

/* ---------- header ---------- */
const header = document.getElementById('site-header');
const onScrollHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
};
onScrollHeader();
window.addEventListener('scroll', onScrollHeader, { passive: true });

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
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- hero entrance (CSS transition triggered by observer) ---------- */
const heroBits = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-in]'));
if (!reduced && 'IntersectionObserver' in window) {
  const hio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        hio.unobserve(el);
        el.style.transitionDelay = `${0.06 * Number(el.dataset.heroIndex || '0')}s`;
        el.classList.add('hero-in');
      }
    },
    { threshold: 0.2 }
  );
  heroBits.forEach((el, i) => {
    el.dataset.heroIndex = `${i}`;
    hio.observe(el);
  });
} else {
  heroBits.forEach((el) => el.classList.add('hero-in'));
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
window.addEventListener('scroll', onScrollDepth, { passive: true });

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
      const gtag = (window as unknown as { gtag: (...a: unknown[]) => void }).gtag;
      gtag('js', new Date());
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

if (stored === 'granted' || stored === 'denied') {
  banner?.classList.add('hidden');
  applyConsent(stored);
} else {
  banner?.classList.remove('hidden');
}

document.getElementById('consent-accept')?.addEventListener('click', () => {
  writeStoredConsent('granted');
  applyConsent('granted');
  banner?.classList.add('hidden');
  returnFocusToManage();
  track('consent_granted', {});
});
document.getElementById('consent-decline')?.addEventListener('click', () => {
  writeStoredConsent('denied');
  applyConsent('denied');
  banner?.classList.add('hidden');
  returnFocusToManage();
});
// Keyboard users must be able to dismiss the banner: Esc = decline.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && banner && !banner.classList.contains('hidden')) {
    document.getElementById('consent-decline')?.click();
  }
});

// Focus trap while the banner is open + return focus to the Cookie button on close.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab' || !banner || banner.classList.contains('hidden')) return;
  const items = Array.from(banner.querySelectorAll<HTMLElement>('button, a[href]')).filter(
    (el) => !el.hasAttribute('disabled')
  );
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
function returnFocusToManage() {
  document.getElementById('consent-manage')?.focus();
}
document.getElementById('consent-manage')?.addEventListener('click', () => {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* noop */
  }
  banner?.classList.remove('hidden');
});

export {};
