'use server';

import type { Article } from '@/db/schema';
import { getBookmarksFromUser } from '@/lib/db';
import type { User } from '@supabase/supabase-js';
import getSHA256 from '../utils/sha256';
import { redis } from '../utils/upstash';

interface CacheArticle extends Article {
	embedding: number[] | null;
	publishedAt: Date;
}

const fetchBookmarks = async (user: User) => {
	const cacheHash = getSHA256(`${user.id}bookmarks`);
	const cache = await redis.get<CacheArticle[]>(cacheHash);

	if (cache) {
		return cache.map((c) => ({ ...c, publishedAt: new Date(c.publishedAt) }));
	}

	const data = await getBookmarksFromUser(user.id);

	const articles = data.map((d) => {
		return {
			...d.article,
			embedding: null,
			publishedAt: new Date(d.article.publishedAt),
		} satisfies CacheArticle;
	});

	await redis.set(cacheHash, articles);

	// Cache for 1 day
	await redis.expire(cacheHash, 60 * 60 * 24);

	return articles;
};

export { fetchBookmarks };
