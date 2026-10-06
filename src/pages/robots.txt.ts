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
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'Bytespider',
  'YandexBot',
  'YandexAdditional',
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
