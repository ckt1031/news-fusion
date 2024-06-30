'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { getSharedArticle, saveSharedArticle } from '@/lib/db';
import { nanoid } from 'nanoid';
import { redis } from '../utils/upstash';
import { getSharedArticleCacheKey } from './[id]/cache';
import { SaveSharedArticleSchema } from './schema';

export const saveSharedArticleAction = authActionClient
	.schema(SaveSharedArticleSchema)
	.action(async ({ parsedInput: formData, ctx: { user } }) => {
		const id = nanoid();

		await saveSharedArticle({
			id,
			userId: user.id,
			articleId: formData.articleId,
			longSummary: formData.longSummary,
			sources: formData.sources,
			thumbnail: formData.thumbnail,
		});

		const cacheKey = getSharedArticleCacheKey(id);

		const data = await getSharedArticle(id);

		await redis.set(cacheKey, data);

		// Set cache to expire in 3 days
		await redis.expire(cacheKey, 60 * 60 * 24 * 3);

		return { id, success: true };
	});
