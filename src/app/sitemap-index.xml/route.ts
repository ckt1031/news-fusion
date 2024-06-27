import { type ISitemapField, getServerSideSitemap } from 'next-sitemap';
import { nextEnv } from '../env';
import { generateStaticParams } from '../topic/[slug]/page';

export const runtime = 'edge';

export async function GET() {
	const getAllTopics = await generateStaticParams();

	const topics: ISitemapField[] = getAllTopics.map((topic) => ({
		loc: `${nextEnv.SITE_URL}/topic/${encodeURIComponent(topic.slug)}`,
		lastmod: new Date().toISOString(),
		changefreq: 'monthly',
		priority: 0.8,
	}));

	return getServerSideSitemap([
		{
			loc: nextEnv.SITE_URL,
			lastmod: new Date().toISOString(),
			changefreq: 'yearly',
			priority: 1,
		},
		...topics,
	]);
}
