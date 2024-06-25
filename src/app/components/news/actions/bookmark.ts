'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { addArticleUserRelation } from '@/lib/db';
import { BookmarkActionSchema } from './schema';

export const addBookmarkAction = authActionClient
	.schema(BookmarkActionSchema)
	.action(async ({ parsedInput: formData, ctx: { user } }) => {
		const status = await addArticleUserRelation(
			user.user.id,
			formData.articleId,
		);

		return { status };
	});
