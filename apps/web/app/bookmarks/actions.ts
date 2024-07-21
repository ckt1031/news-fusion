'use server';

import { getBookmarkTags } from '@/utils/next-cache-tag';
import { getBookmarksFromUser } from '@ckt1031/db';
import type { User } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

export type Bookmarks = Awaited<
	ReturnType<typeof getBookmarksFromUser>
>[number]['article'][];

export async function fetchBookmarks(user: User) {
	const tags = [getBookmarkTags(user.id)];

	const getCachedBookmark = unstable_cache(
		async () => getBookmarksFromUser(user.id),
		tags,
		{
			tags,
			revalidate: 60 * 60, // Cache for 1 hour
		},
	);

	const cache = await getCachedBookmark();

	return cache.map((c) => ({
		...c.article,
		publishedAt: new Date(c.article.publishedAt),
	}));
}
