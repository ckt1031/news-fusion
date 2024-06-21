'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { llmTranslateText } from '@/lib/llm/prompt-calls';
import { googleTranslate } from '@/lib/tool-apis';
import type { ServerEnv } from '@/types/env';
import { TranslateActionSchema } from './schema';

export const translateNewsInfo = authActionClient
	.schema(TranslateActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const env = process.env as unknown as ServerEnv;

		async function _translateText(t: string) {
			if (formData.useLLM) {
				return await llmTranslateText(
					env,
					t,
					formData.targetLanguage === 'en'
						? 'English'
						: 'Traditional Chinese (Hong Kong)',
				);
			}

			const { result } = await googleTranslate(
				env,
				t,
				formData.targetLanguage ?? 'zh-tw',
			);
			return result;
		}

		const [title, summary] = await Promise.all([
			_translateText(formData.title),
			_translateText(formData.summary),
		]);

		return {
			title,
			summary,
		};
	});
