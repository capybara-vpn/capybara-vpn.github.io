import { site } from '../data/site';

/**
 * Generated at build time so the Sitemap URL always matches SITE_URL,
 * including project-subpath deploys (actions/configure-pages sets it).
 * Crawlers for search engines and AI systems are welcome.
 */
const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'OAI-AdsBot',  'ClaudeBot',
  'anthropic-ai',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Google-CloudVertexBot',
  'GoogleOther',
  'Google-GeminiNotebook',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'FacebookBot',
  'Amazonbot',
  'Amzn-SearchBot',
  'Amzn-User',
  'DuckAssistBot',
  'Applebot',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'MistralAI-User',
  'YouBot',
  'Diffbot',
  'cohere-ai',
  'CohereBot',
  'cohere-training-data-crawler',
  'AI2Bot',
  'iaskspider',
  'TimpiBot',
  'Omgili',
  'Omgilibot',
] as const;

/**
 * Classic search engines. The HTML pages are the ones meant for the search
 * index; the Markdown mirrors (/ios.md and friends) duplicate them for AI
 * readers, so they are kept out of the search index to avoid duplicate
 * content. The AI crawlers above still get full access.
 */
const SEARCH_BOTS = [
  'Googlebot',
  'Googlebot-Image',
  'Googlebot-News',
  'Googlebot-Video',
  'Bingbot',
  'BingPreview',
  'YandexBot',
  'YandexAdditional',
  'YandexAdditionalBot',
  'DuckDuckBot',
  'Baiduspider',
] as const;

export async function GET() {
  const lines = [
    '# Machine-readable service summary: /llms.txt',
    '',
    'User-agent: *',
    'Allow: /',
    // The error page is served with noindex and is not in the sitemap.
    'Disallow: /404.html',
    '',
    '# AI assistants and generative-engine crawlers (explicit allow)',
    ...AI_BOTS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    '# Search engines: the HTML pages only, the .md mirrors are for AI readers',
    ...SEARCH_BOTS.flatMap((bot) => [`User-agent: ${bot}`, 'Disallow: /*.md', '']),
    `Sitemap: ${site.siteUrl}/sitemap-index.xml`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
