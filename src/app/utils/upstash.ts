'server only';

import { createClient } from '@vercel/kv';
import { nextServerEnv } from './env/server';
import getSHA256 from './sha256';

export const redis = createClient({
	url: nextServerEnv.UPSTASH_REDIS_REST_URL,
	token: nextServerEnv.UPSTASH_REDIS_REST_TOKEN,
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let cache: Map<string, any> | null = null;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function getMapCache(): Map<string, any> {
	if (!cache) {
		cache = new Map();
	}
	return cache;
}

export const getBookmarkCacheHash = (userId: string) => {
	return getSHA256(`${userId}_NEWS_BOOKMARKS`);
};

export const getSummarizedArticlesCacheHash = (userId?: string) => {
	return getSHA256(
		userId ? `${userId}_SUMMARIZED_ARTICLES` : 'SUMMARIZED_ARTICLES',
	);
};
