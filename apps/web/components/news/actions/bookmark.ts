'use server';

import { getBookmarkTags } from '@/utils/next-cache-tag';
import { authActionClient } from '@/utils/safe-action';
import { addArticleUserRelation, removeArticleUserRelation } from '@ckt1031/db';
import { revalidateTag } from 'next/cache';
import { BookmarkActionSchema } from './schema';

export const addBookmarkAction = authActionClient
	.schema(BookmarkActionSchema)
	.action(async ({ parsedInput: formData, ctx: { user } }) => {
		const status = await addArticleUserRelation(user.id, formData.articleId);

		const tags = getBookmarkTags(user.id);

		revalidateTag(tags);

		return { status };
	});

export const removeBookmarkAction = authActionClient
	.schema(BookmarkActionSchema)
	.action(async ({ parsedInput: formData, ctx: { user } }) => {
		await removeArticleUserRelation(user.id, formData.articleId);

		const tags = getBookmarkTags(user.id);

		revalidateTag(tags);

		return { success: true };
	});

export const clearBookmarksCacheAction = authActionClient.action(
	async ({ ctx: { user } }) => {
		const tags = getBookmarkTags(user.id);

		revalidateTag(tags);

		return { success: true };
	},
);
