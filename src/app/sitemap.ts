import { nextServerEnv } from '@/app/utils/env/server';
import { getAllNewsCatagorySlug } from '@/app/utils/news-catagory';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	const getAllTopics = getAllNewsCatagorySlug();

	const topics: MetadataRoute.Sitemap = getAllTopics.map((topic) => ({
		url: `${nextServerEnv.SITE_URL}/topic/${encodeURIComponent(topic.slug)}`,
		lastModified: new Date().toISOString(),
		changeFrequency: 'daily',
		priority: 0.8,
	}));

	return [
		{
			url: nextServerEnv.SITE_URL,
			lastModified: new Date().toISOString(),
			changeFrequency: 'yearly',
			priority: 1,
		},
		{
			url: `${nextServerEnv.SITE_URL}/about`,
			lastModified: new Date().toISOString(),
			changeFrequency: 'monthly',
			priority: 0.9,
		},
		...topics,
	];
}
