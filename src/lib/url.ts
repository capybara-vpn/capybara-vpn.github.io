/** Shared base-path helpers (single source; replaces per-file withBase/wb copies). */
// biome-ignore lint: env access is intentional here (same pattern as src/data/site.ts)
const base =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.BASE_URL ?? '/';
const b = base.endsWith('/') ? base.slice(0, -1) : base;
const withBase = (p: string) => `${b}${p.startsWith('/') ? p : `/${p}`}` || '/';

export { b, withBase };
