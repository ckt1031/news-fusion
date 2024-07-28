'use server';

import { nextServerEnv } from '@/utils/env/server';
import { authActionClient } from '@/utils/safe-action';
import { generateTitle, summarizeIntoShortText } from '@ckt1031/ai';
import { updateArticleDatabase } from '@ckt1031/db';
import { getContentMarkdownFromURL } from '@ckt1031/tool-api';
import { revalidateTag } from 'next/cache';
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

		revalidateTag(formData.category);

		return { sumary, title };
	});
