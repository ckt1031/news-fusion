import type { MetadataRoute } from 'next';
import { generateStaticParams } from './topic/[slug]/page';

export const SITE_URL = process.env.SITE_URL ?? 'https://news.tsun1031.xyz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const getAllTopics = await generateStaticParams();

	const topics: MetadataRoute.Sitemap = getAllTopics.map((topic) => ({
		url: `${SITE_URL}/topic/${encodeURIComponent(topic.slug)}`,
		lastModified: new Date(),
		changeFrequency: 'monthly',
		priority: 0.8,
	}));

	return [
		{
			url: SITE_URL,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 1,
		},
		...topics,
	];
}
