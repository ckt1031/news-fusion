'use server';

import { getDateTag } from '@/utils/next-cache-tag';
import type { RSS_CATEGORY } from '@ckt1031/config';
import type { Article } from '@ckt1031/db';
import { getNewsBasedOnDateAndCategory } from '@ckt1031/db';
import { unstable_cache } from 'next/cache';

export type DateRange = {
	from: string;
	to: string;
};

export type DateType = string | DateRange;

export interface FetchNewsPageProps {
	category: RSS_CATEGORY;
	date: DateType;
}

export interface CacheArticle extends Omit<Article, 'embedding'> {
	publishedAt: Date;
}

export async function fetchNewsForPage({
	category,
	date,
}: Omit<FetchNewsPageProps, 'userStatus'>) {
	const tags = [category, getDateTag(date)];
	const getCachedDatedNews = unstable_cache(
		async () => getNewsBasedOnDateAndCategory(date, category),
		tags,
		{
			tags,
			revalidate: 60 * 15,
		},
	);

	const cache = await getCachedDatedNews();

	return cache.map((c) => ({ ...c, publishedAt: new Date(c.publishedAt) }));
}
