/**
 * Self-hosted, subsetted variable fonts.
 *
 * Two families, each split into unicode-range subsets so a page downloads
 * only what its glyphs need:
 *  - Inter Variable  — body and UI (latin + cyrillic + a 1.2 KB ruble-sign
 *    subset: the stock @fontsource split put U+20BD into latin-ext, which
 *    cost an extra 85 KB on every page).
 *  - Unbounded — display face for headlines and big numbers. Its own latin
 *    subset does not carry the ruble sign, so prices set in Unbounded render
 *    the ₽ glyph from Inter — intentional here: the currency is set slightly
 *    smaller than the digits anyway.
 *
 * No mono face on purpose: "data voice" is Inter with tabular figures
 * (.mono in global.css) — a monospaced Cyrillic read as terminal-cool and
 * the owner rejected it (2026-11-13).
 */
import interLatin from '../fonts/inter-latin.woff2?url';
import interCyrillic from '../fonts/inter-cyrillic.woff2?url';
import interRuble from '../fonts/inter-ruble.woff2?url';
import unboundedLatin from '../fonts/unbounded-latin.woff2?url';
import unboundedCyrillic from '../fonts/unbounded-cyrillic.woff2?url';

export const fontUrls = {
  latin: interLatin,
  cyrillic: interCyrillic,
  ruble: interRuble,
  displayLatin: unboundedLatin,
  displayCyrillic: unboundedCyrillic,
};

/** Only the files that shape the first paint are preloaded. */
export const preloadUrls = [interLatin, interCyrillic, unboundedLatin, unboundedCyrillic];

export const fontFaces = `
@font-face{font-family:'Inter Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url('${interLatin}') format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Inter Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url('${interCyrillic}') format('woff2-variations');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:'Inter Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url('${interRuble}') format('woff2-variations');unicode-range:U+20BD}
@font-face{font-family:'Unbounded';font-style:normal;font-display:swap;font-weight:200 900;src:url('${unboundedCyrillic}') format('woff2-variations');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:'Unbounded';font-style:normal;font-display:swap;font-weight:200 900;src:url('${unboundedLatin}') format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
`;
