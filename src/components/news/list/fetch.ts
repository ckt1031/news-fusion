'use server';

import type { RSS_CATEGORY } from '@/config/news-sources';
import type { Article } from '@/db/schema';
import { getNewsBasedOnDateAndCategory } from '@/lib/db';
import { getDateTag } from '@/lib/next-cache-tag';
import { unstable_cache } from 'next/cache';

export type DateRange = {
	from: string;
	to: string;
};

export type DateType = string | DateRange;

export interface FetchNewsPageProps {
	catagory: RSS_CATEGORY;
	date: DateType;
}

export interface CacheArticle extends Omit<Article, 'embedding'> {
	publishedAt: Date;
}

export async function fetchNewsForPage({
	catagory,
	date,
}: Omit<FetchNewsPageProps, 'userStatus'>) {
	const tags = [catagory, getDateTag(date)];
	const getCachedDatedNews = unstable_cache(
		async () => getNewsBasedOnDateAndCategory(date, catagory),
		tags,
		{
			tags,
			revalidate: 60 * 15,
		},
	);

	const cache = await getCachedDatedNews();

	return cache.map((c) => ({ ...c, publishedAt: new Date(c.publishedAt) }));
}
