'use server';

import { redis } from '@/app/utils/upstash';
import type { RSS_CATEGORY } from '@/config/news-sources';
import type { Article } from '@/db/schema';
import logging from '@/lib/console';
import { getNewsBasedOnDateAndCategory } from '@/lib/db';
import dayjs from 'dayjs';
import getNewsPageRedisCacheKey from '../actions/get-cache-key';

export type DateRange = {
	from: string;
	to: string;
};

export type DateType = string | DateRange;

export interface FetchNewsPageProps {
	topic: RSS_CATEGORY;
	date: DateType;
}

interface CacheArticle extends Omit<Article, 'embedding'> {
	publishedAt: Date;
}

export async function fetchNewsForPage({
	topic,
	date,
}: Omit<FetchNewsPageProps, 'userStatus'>) {
	const cacheHash = getNewsPageRedisCacheKey(
		typeof date === 'string' ? date : `${date.from}-${date.to}`,
		topic,
	);
	const cache = await redis.get<CacheArticle[]>(cacheHash);

	logging.info(`Cache ${cache ? 'hit' : 'miss'}`);

	if (cache) {
		return cache.map((c) => ({ ...c, publishedAt: new Date(c.publishedAt) }));
	}

	const articles = await getNewsBasedOnDateAndCategory(
		typeof date === 'string'
			? date
			: {
					from: date.from,
					to: date.to,
				},
		topic,
		// true,
	);
	const sortedArticles = articles
		// Sort by publishedAt
		.sort((a, b) => {
			return (
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
			);
		})
		// Remove items with duplicated title
		.filter(
			(article, index, self) =>
				index ===
				self.findIndex(
					(t) => t.title.toLowerCase() === article.title.toLowerCase(),
				),
		)
		// Structure the data
		.map((article) => {
			return {
				...article,
				publishedAt: new Date(article.publishedAt),
			};
		});

	const isToday =
		typeof date === 'string'
			? dayjs(date).isSame(dayjs(), 'day')
			: dayjs(date.to).isSame(dayjs(), 'day');

	await redis.set(cacheHash, sortedArticles, {
		ex: isToday ? 60 * 15 : 3 * 60 * 60,
	});

	return sortedArticles;
}
