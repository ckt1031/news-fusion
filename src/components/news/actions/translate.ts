'use server';

import { nextServerEnv } from '@/app/utils/env/server';
import { authActionClient } from '@/app/utils/safe-action';
import getSHA256 from '@/app/utils/sha256';
import { redis } from '@/app/utils/upstash';
import { TargetLanguageToLLM } from '@/config/api';
import { llmTranslateText } from '@/lib/llm/prompt-calls';
import { TranslateActionSchema } from './schema';

export const translateNewsInfo = authActionClient
	.schema(TranslateActionSchema)
	.action(async ({ parsedInput: formData }) => {
		async function translateText(t: string) {
			const cacheHash = getSHA256([t, formData.targetLanguage]);

			// Only run this if cache is enabled
			if (formData.useCache) {
				const cache = await redis.get<string>(cacheHash);

				if (cache) return cache;
			}

			const lang =
				TargetLanguageToLLM[
					formData.targetLanguage as keyof typeof TargetLanguageToLLM
				] ?? 'English';

			const result = await llmTranslateText(nextServerEnv, t, lang);

			await redis.set(cacheHash, result, {
				ex: 60 * 60 * 24 * 3, // Cache for 3 days
			});

			return result;
		}

		const [title, summary] = await Promise.all([
			translateText(formData.title),
			translateText(formData.summary),
		]);

		return {
			title,
			summary,
		};
	});
