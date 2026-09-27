/**
 * Lightweight client behaviour: header, reveals, analytics (consent-aware),
 * mobile CTA visibility, cursor glow, FAQ tracking.
 * No framework. Motion is used sparingly for hero entrance + counters.
 */
import { animate, inView } from 'motion';

const GA_ID = (document.querySelector('meta[name="ga-id"]')?.getAttribute('content') ||
  (window as unknown as { __GA_ID?: string }).__GA_ID ||
  '') as string;

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

/* ---------- hero entrance (motion, sparingly) ---------- */
if (!reduced) {
  const heroBits = document.querySelectorAll<HTMLElement>('[data-hero-in]');
  heroBits.forEach((el, i) => {
    el.style.opacity = '0';
    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], y: [22, 0] },
          { duration: 0.7, delay: 0.06 * i, easing: [0.22, 1, 0.36, 1] }
        );
      },
      { amount: 0.2 }
    );
  });

  // Animated price numbers in pricing (subtle count-up, once)
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
} else {
  document.querySelectorAll<HTMLElement>('[data-hero-in]').forEach((el) => {
    el.style.opacity = '1';
  });
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

  // Hide while hero is fully out of reach on large screens (CSS already hides on md+)
  let lastY = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      if (finalCta?.getBoundingClientRect && finalCta.getBoundingClientRect().top < window.innerHeight) return;
      const y = window.scrollY;
      // keep visible; only auto-hide on fast upward? No — keep simple: always visible on mobile
      lastY = y;
    },
    { passive: true }
  );
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

/* ---------- consent + GA4 lazy load ---------- */
const CONSENT_KEY = 'capybara-consent-v1';
const banner = document.getElementById('consent');
let gaLoaded = false;

function loadGA(id: string) {
  if (gaLoaded || !id || id.includes('XXXX')) return;
  gaLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
  track('page_view', {});
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
    if (id) loadGA(id);
  }
}

const stored = (() => {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
})();

if (stored === 'granted' || stored === 'denied') {
  banner?.remove();
  applyConsent(stored);
} else {
  banner?.classList.remove('hidden');
}

document.getElementById('consent-accept')?.addEventListener('click', () => {
  try {
    localStorage.setItem(CONSENT_KEY, 'granted');
  } catch {
    /* noop */
  }
  applyConsent('granted');
  banner?.remove();
  track('consent_granted', {});
});
document.getElementById('consent-decline')?.addEventListener('click', () => {
  try {
    localStorage.setItem(CONSENT_KEY, 'denied');
  } catch {
    /* noop */
  }
  applyConsent('denied');
  banner?.remove();
});
document.getElementById('consent-manage')?.addEventListener('click', () => {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* noop */
  }
  banner?.classList.remove('hidden');
});

export {};
