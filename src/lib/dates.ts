import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repository root (this file lives in src/lib/). */
const ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const PAGES_DIR = path.join(ROOT, 'src', 'pages');

/**
 * The source file that renders the page at `canonicalPath`:
 * '/ios/' -> src/pages/ios.astro, '/' -> src/pages/index.astro.
 */
export function pageSource(canonicalPath: string): string | undefined {
  const slug = String(canonicalPath || '/').replace(/^\/+|\/+$/g, '');
  const file = path.join(PAGES_DIR, slug ? `${slug}.astro` : 'index.astro');
  return existsSync(file) ? file : undefined;
}

const cache = new Map<string, string>();

/**
 * ISO timestamp of the last commit that touched `file`.
 * Falls back to the file's mtime and then to the build time, so a shallow
 * clone or an uncommitted file still yields a usable date.
 */
export function lastCommitISO(file: string): string {
  const cached = cache.get(file);
  if (cached) return cached;
  let value = '';
  try {
    value = execSync(`git log -1 --format=%cI -- "${file}"`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    value = '';
  }
  if (!value) {
    try {
      value = statSync(file).mtime.toISOString();
    } catch {
      value = new Date().toISOString();
    }
  }
  cache.set(file, value);
  return value;
}

/**
 * The day the page was last changed, as YYYY-MM-DD.
 * Used for dateModified and for the visible "Обновлено" line, so the date
 * on the page always matches the last real edit instead of a manual stamp.
 */
export function lastModifiedDate(canonicalPath: string): string {
  const file = pageSource(canonicalPath);
  if (!file) return new Date().toISOString().slice(0, 10);
  return lastCommitISO(file).slice(0, 10);
}

/** Same date, written for people: "21 октября 2026". */
export function formatRuDate(iso: string): string {
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const month = months[Number(mo) - 1] ?? mo;
  return `${Number(d)} ${month} ${y}`;
}
