'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { redis } from '@/app/utils/upstash';
import getNewsPageRedisCacheKey from './get-cache-key';
import { ClearTopicNewsCacheActionSchema } from './schema';

export const clearTopicNewsPageCacheAction = authActionClient
	.schema(ClearTopicNewsCacheActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const cacheHash = getNewsPageRedisCacheKey(
			formData.to && formData.from
				? `${formData.from}-${formData.to}`
				: formData.date ?? '',
			formData.topic,
		);
		const cache = await redis.exists(cacheHash);

		if (cache > 0) await redis.del(cacheHash);

		return { success: true };
	});
