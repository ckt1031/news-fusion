'use server';

import { redis } from '@/app/utils/upstash';
import { getSharedArticle } from '@/lib/db';
import { getSharedArticleCacheKey } from './cache';
import type { SharedArticleFetchingReturnProps } from './schema';

export async function getCache(id: string) {
	const cacheKey = getSharedArticleCacheKey(id);

	return await redis.get<SharedArticleFetchingReturnProps>(cacheKey);
}

export async function clearCache(id: string) {
	const cacheKey = getSharedArticleCacheKey(id);

	await redis.del(cacheKey);
}

export default async function fetchSharedArticle(id: string) {
	const cacheKey = getSharedArticleCacheKey(id);

	const cache = await getCache(id);

	if (cache) return cache;

	const data = await getSharedArticle(id);

	await redis.set(cacheKey, data, {
		ex: 60 * 60 * 24 * 3, // Cache for 3 days
	});

	return data satisfies SharedArticleFetchingReturnProps;
}
