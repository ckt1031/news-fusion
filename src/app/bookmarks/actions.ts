'use server';

import { getBookmarksFromUser } from '@/lib/db';
import { getBookmarkTags } from '@/lib/next-cache-tag';
import type { User } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

export type Bookmarks = Awaited<
	ReturnType<typeof getBookmarksFromUser>
>[number]['article'][];

export async function fetchBookmarks(user: User) {
	const getCachedBookmark = unstable_cache(
		async () => getBookmarksFromUser(user.id),
		[getBookmarkTags(user.id)],
		{
			revalidate: 60 * 60, // Cache for 1 hour
			tags: [getBookmarkTags(user.id)],
		},
	);

	const cache = await getCachedBookmark();

	return cache.map((c) => ({
		...c.article,
		publishedAt: new Date(c.article.publishedAt),
	}));
}
