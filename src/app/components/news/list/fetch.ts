'use server';

import { redis } from '@/app/utils/upstash';
import type { RSS_CATEGORY } from '@/config/news-sources';
import type { Article } from '@/db/schema';
import { getNewsBasedOnDateAndCategory } from '@/lib/db';
import consola from 'consola';
import dayjs from 'dayjs';
import getNewsPageRedisCacheKey from '../actions/get-cache-key';

export interface FetchNewsPageProps {
	topic: RSS_CATEGORY;
	date: string;
	to?: string;
	from?: string;
}

export async function fetchNewsForPage({
	topic,
	date,
	to,
	from,
}: Omit<FetchNewsPageProps, 'userStatus'>) {
	const cacheHash = getNewsPageRedisCacheKey(
		to && from ? `${from}-${to}` : date,
		topic,
	);
	const cache = await redis.get<Article[]>(cacheHash);

	consola.info(`Cache ${cache ? 'hit' : 'miss'}`);

	if (cache) {
		return cache.map((article) => {
			return {
				...article,
				publishedAt: new Date(article.publishedAt),
			};
		});
	}

	const articles = await getNewsBasedOnDateAndCategory(
		to && from
			? {
					from,
					to,
				}
			: date,
		topic,
		true,
	);
	const sortedArticles = articles
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
				id: article.id,
				guid: article.guid,
				title: article.title,
				url: article.url,
				summary: article.summary,
				publisher: article.publisher,
				publishedAt: article.publishedAt,
				similarArticles: article.similarArticles,
			};
		});

	await redis.set(cacheHash, sortedArticles);

	const isToday =
		to && from
			? dayjs(to).isSame(dayjs(), 'day')
			: dayjs(date).isSame(dayjs(), 'day');

	// 15 minutes for today, 24 hours for other days
	await redis.expire(cacheHash, isToday ? 60 * 15 : 60 * 60 * 24);

	return sortedArticles;
}
