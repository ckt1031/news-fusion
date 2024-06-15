'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { redis } from '@/app/utils/upstash';
import getCacheKey from './get-cache-key';
import { clearCacheActionSchema } from './schema';

export const clearCacheAction = authActionClient
	.schema(clearCacheActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const cacheHash = getCacheKey(formData.date, formData.topic);
		const cache = await redis.exists(cacheHash);

		if (cache > 0) await redis.del(cacheHash);

		return { success: true };
	});
