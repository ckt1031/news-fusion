'use server';

import { authActionClient } from '@/app/utils/safe-action';
import getSHA256 from '@/app/utils/sha256';
import { redis } from '@/app/utils/upstash';
import { addArticleUserRelation, removeArticleUserRelation } from '@/lib/db';
import { BookmarkActionSchema } from './schema';

export const addBookmarkAction = authActionClient
	.schema(BookmarkActionSchema)
	.action(async ({ parsedInput: formData, ctx: { user } }) => {
		const status = await addArticleUserRelation(user.id, formData.articleId);

		return { status };
	});

export const removeBookmarkAction = authActionClient
	.schema(BookmarkActionSchema)
	.action(async ({ parsedInput: formData, ctx: { user } }) => {
		await removeArticleUserRelation(user.id, formData.articleId);

		return { success: true };
	});

export const clearBookmarksCacheAction = authActionClient.action(
	async ({ ctx: { user } }) => {
		const cacheHash = getSHA256(`${user.id}bookmarks`);
		await redis.del(cacheHash);

		return { success: true };
	},
);
