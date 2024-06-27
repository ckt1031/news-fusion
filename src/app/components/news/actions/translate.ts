'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { llmTranslateText } from '@/lib/llm/prompt-calls';
import type { ServerEnv } from '@/types/env';
import { TranslateActionSchema } from './schema';

export const translateNewsInfo = authActionClient
	.schema(TranslateActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const env = process.env as unknown as ServerEnv;

		async function translateText(t: string) {
			return await llmTranslateText(
				env,
				t,
				formData.targetLanguage === 'en'
					? 'English'
					: 'Traditional Chinese (Hong Kong)',
			);
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
