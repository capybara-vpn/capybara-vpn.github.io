import { site } from '../data/site';

/**
 * Generated at build time so the Sitemap URL always matches SITE_URL,
 * including project-subpath deploys (actions/configure-pages sets it).
 *
 * Nothing is blocked for anyone: search engines, AI assistants and any
 * other client may crawl the whole site. The per-bot Disallow groups the
 * file used to carry (/*.md, /llms.txt, /llms-full.txt for classic search
 * bots) tripped "blocked by robots.txt" warnings in Bing Webmaster Tools,
 * so they are gone. The .md mirrors and the llms files are free to crawl;
 * the search index keeps them out by cleaner means than robots.txt:
 * they are not in the sitemap (see the sitemap filter in astro.config.mjs).
 */
export async function GET() {
  const lines = [
    '# Everything on this site may be crawled. No exceptions.',
    '# Text mirrors of the pages: /llms.txt (summary), /llms-full.txt (full).',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site.siteUrl}/sitemap-index.xml`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
