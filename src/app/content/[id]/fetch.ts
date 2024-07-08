'use server';

import { redis } from '@/app/utils/upstash';
import { fetchArticle } from '@/lib/db';
import { getArticleCacheKey } from './cache';
import type { ArticleFetchingReturnProps } from './schema';

export async function getCache(id: number) {
	const cacheKey = getArticleCacheKey(id.toString());

	return await redis.get<ArticleFetchingReturnProps>(cacheKey);
}

export default async function fetchCachedArticle(id: number) {
	const cacheKey = getArticleCacheKey(id.toString());

	const cache = await getCache(id);

	if (cache) return cache;

	const data = await fetchArticle(id);

	await redis.set(cacheKey, data, {
		ex: 60 * 60 * 24 * 3, // Cache for 3 days
	});

	return data satisfies ArticleFetchingReturnProps;
}
