'use server';

import { nextServerEnv } from '@/utils/env/server';
import { authActionClient } from '@/utils/safe-action';
import { llmTranslateText } from '@ckt1031/ai';
import { redis } from '@ckt1031/cache/src/redis';
import { TargetLanguageToLLM } from '@ckt1031/config';
import { getSHA256 } from '@ckt1031/utils';
import { TranslateActionSchema } from './schema';

export const translateNewsInfo = authActionClient
	.schema(TranslateActionSchema)
	.action(async ({ parsedInput: formData }) => {
		async function translateText(t: string) {
			const cacheHash = getSHA256([
				t,
				formData.targetLanguage,
				formData.llmModel ?? 'DEFAULT_MODEL',
			]);

			// Only run this if cache is enabled
			if (formData.useCache) {
				const cache = await redis.get<string>(cacheHash);

				if (cache) return cache;
			}

			const lang =
				TargetLanguageToLLM[
					formData.targetLanguage as keyof typeof TargetLanguageToLLM
				] ?? 'English';

			const result = await llmTranslateText(
				nextServerEnv,
				t,
				lang,
				formData.llmModel,
			);

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
