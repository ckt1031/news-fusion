'use server';

import { getBookmarksFromUser } from '@/lib/db';
import type { User } from '@supabase/supabase-js';
import { getBookmarkCacheHash, redis } from '../utils/upstash';

export type Bookmarks = Awaited<
	ReturnType<typeof getBookmarksFromUser>
>[number]['article'][];

const fetchBookmarks = async (user: User) => {
	const cacheHash = getBookmarkCacheHash(user.id);

	const cache = await redis.get<Bookmarks>(cacheHash);

	if (cache) {
		return cache.map((c) => ({
			...c,
			publishedAt: new Date(c.publishedAt),
		}));
	}

	const data = await getBookmarksFromUser(user.id);

	const articles = data.map((d) => {
		return {
			...d.article,
			publishedAt: new Date(d.article.publishedAt),
		};
	});

	await redis.set(cacheHash, articles, {
		ex: 60 * 60 * 24, // Cache for 1 day
	});

	return articles;
};

export { fetchBookmarks };
