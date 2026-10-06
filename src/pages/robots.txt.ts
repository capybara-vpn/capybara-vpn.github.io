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
  'OAI-AdsBot',
  'ClaudeBot',
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
  'YandexBot',
  'YandexAdditional',
  'YandexAdditionalBot',
  'Bingbot',
  'BingPreview',
] as const;

export async function GET() {
  const lines = [
    '# Machine-readable service summary: /llms.txt',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# AI assistants and generative-engine crawlers (explicit allow)',
    ...AI_BOTS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    `Sitemap: ${site.siteUrl}/sitemap-index.xml`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
