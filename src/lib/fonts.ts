/**
 * Inter (variable), self-hosted and subsetted.
 *
 * The stock @fontsource split put the ruble sign (U+20BD) into the
 * latin-ext subset, so every page downloaded an extra 85 KB file just to
 * render "249 ₽". The site needs three files instead: latin, cyrillic and a
 * 1.2 KB subset with the ruble sign alone — 56 KB instead of 152 KB.
 */
import interLatin from '../fonts/inter-latin.woff2?url';
import interCyrillic from '../fonts/inter-cyrillic.woff2?url';
import interRuble from '../fonts/inter-ruble.woff2?url';

export const fontUrls = {
  latin: interLatin,
  cyrillic: interCyrillic,
  ruble: interRuble,
};

export const fontFaces = `
@font-face{font-family:'Inter Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url('${interLatin}') format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Inter Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url('${interCyrillic}') format('woff2-variations');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:'Inter Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url('${interRuble}') format('woff2-variations');unicode-range:U+20BD}
`;
