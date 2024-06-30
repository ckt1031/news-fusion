'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { deleteSharedArticle, getSharedArticle } from '@/lib/db';
import { clearCache, getCache } from './fetch';
import { DeleteSchema } from './schema';

export const deleteSharedArticleAction = authActionClient
	.schema(DeleteSchema)
	.action(async ({ parsedInput: formData, ctx: { user } }) => {
		let data = await getCache(formData.id);

		if (!data) {
			data = await getSharedArticle(formData.id);

			if (!data) return { success: false, message: 'Article not found' };
		}

		if (user.id !== data.userId)
			return { success: false, message: 'Unauthorized' };

		await clearCache(formData.id);

		await deleteSharedArticle(formData.id);

		return { success: true };
	});
