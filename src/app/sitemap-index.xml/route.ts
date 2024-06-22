import { getServerSideSitemap, type ISitemapField } from 'next-sitemap'
import { generateStaticParams } from '../topic/[slug]/page';

export const SITE_URL = process.env.SITE_URL ?? 'https://news.tsun1031.xyz';

export async function GET() {
  const getAllTopics = await generateStaticParams();

	const topics: ISitemapField[] = getAllTopics.map((topic) => ({
		loc: `${SITE_URL}/topic/${encodeURIComponent(topic.slug)}`,
		lastmod: new Date().toISOString(),
		changefreq: 'monthly',
		priority: 0.8,
	}));

  return getServerSideSitemap([
		{
			loc: SITE_URL,
			lastmod: new Date().toISOString(),
			changefreq: 'yearly',
			priority: 1,
		},
    ...topics
  ])
}
