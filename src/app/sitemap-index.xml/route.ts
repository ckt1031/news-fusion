import { type ISitemapField, getServerSideSitemap } from 'next-sitemap';
import { generateStaticParams } from '../topic/[slug]/page';
import { nextServerEnv } from '../utils/env/server';

export async function GET() {
	const getAllTopics = await generateStaticParams();

	const topics: ISitemapField[] = getAllTopics.map((topic) => ({
		loc: `${nextServerEnv.SITE_URL}/topic/${encodeURIComponent(topic.slug)}`,
		lastmod: new Date().toISOString(),
		changefreq: 'monthly',
		priority: 0.8,
	}));

	return getServerSideSitemap([
		{
			loc: nextServerEnv.SITE_URL,
			lastmod: new Date().toISOString(),
			changefreq: 'yearly',
			priority: 1,
		},
		...topics,
	]);
}
