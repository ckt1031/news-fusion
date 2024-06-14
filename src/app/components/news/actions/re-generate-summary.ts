'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { redis } from '@/app/utils/upstash';
import { updateArticleDatabase } from '@/lib/db';
import { summarizeIntoShortText } from '@/lib/llm/prompt-calls';
import { getContentMarkdownFromURL } from '@/lib/tool-apis';
import type { ServerEnv } from '@/types/env';
import getCacheKey from './get-cache-key';
import { ReGenSummaryActionSchema } from './schema';

export const reGenerateSummary = authActionClient
	.schema(ReGenSummaryActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const env = process.env as unknown as ServerEnv;
		const content = await getContentMarkdownFromURL(env, formData.url);
		const shortSummary = await summarizeIntoShortText(env, content);

		await updateArticleDatabase(formData.guid, {
			summary: shortSummary,
		});

		const cacheHash = getCacheKey(formData.date, formData.topic);
		const cache = await redis.exists(cacheHash);

		if (cache > 0) {
			await redis.del(cacheHash);
		}

		return shortSummary;
	});
