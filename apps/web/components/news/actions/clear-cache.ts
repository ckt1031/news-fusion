'use server';

import { getDateTag } from '@/utils/next-cache-tag';
import { authActionClient } from '@/utils/safe-action';
import { revalidateTag } from 'next/cache';
import { ClearTopicNewsCacheActionSchema } from './schema';

export const clearTopicNewsPageCacheAction = authActionClient
	.schema(ClearTopicNewsCacheActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const dateObject =
			formData.to && formData.from
				? { from: formData.from, to: formData.to }
				: formData.date;

		const tags = getDateTag(dateObject);

		revalidateTag(tags);
		revalidateTag(formData.category);

		return { success: true };
	});
