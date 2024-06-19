'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { llmTranslateText } from '@/lib/llm/prompt-calls';
import type { ServerEnv } from '@/types/env';
import translate from '@iamtraction/google-translate';
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

			const { text } = await translate(t, {
				to: formData.targetLanguage ?? 'zh-tw',
			});
			return text;
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
