'use server';

import { authActionClient } from '@/app/utils/safe-action';
import translate from '@iamtraction/google-translate';
import { TranslateActionSchema } from './schema';

export const translateNewsInfo = authActionClient
	.schema(TranslateActionSchema)
	.action(async ({ parsedInput: formData }) => {
		async function translateText(t: string) {
			const { text } = await translate(t, { to: 'zh-tw' });
			return text;
		}

		return {
			title: await translateText(formData.title),
			summary: await translateText(formData.summary),
		};
	});
