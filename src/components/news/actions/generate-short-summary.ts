'use server';

import { nextServerEnv } from '@/app/utils/env/server';
import { authActionClient } from '@/app/utils/safe-action';
import { updateArticleDatabase } from '@/lib/db';
import { generateTitle, summarizeIntoShortText } from '@/lib/llm/prompt-calls';
import { getContentMarkdownFromURL } from '@/lib/tool-apis';
import { GenerateContentActionSchema } from './schema';

export const generateContent = authActionClient
	.schema(GenerateContentActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const content = await getContentMarkdownFromURL(
			nextServerEnv,
			formData.url,
		);

		const [sumary, title] = await Promise.all([
			formData.generateSummary
				? summarizeIntoShortText(nextServerEnv, content, formData.llmModel)
				: null,
			formData.generateTitle
				? generateTitle(nextServerEnv, content, formData.llmModel)
				: null,
		]);

		await updateArticleDatabase(formData.guid, {
			...(sumary && { summary: sumary }),
			...(title && { title }),
		});

		return { sumary, title };
	});
