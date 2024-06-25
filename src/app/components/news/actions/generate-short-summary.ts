'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { updateArticleDatabase } from '@/lib/db';
import { generateTitle, summarizeIntoShortText } from '@/lib/llm/prompt-calls';
import { getContentMarkdownFromURL } from '@/lib/tool-apis';
import type { ServerEnv } from '@/types/env';
import { GenerateContentActionSchema } from './schema';

export const generateShortSummary = authActionClient
	.schema(GenerateContentActionSchema)
	.action(async ({ parsedInput: formData }) => {
		const env = process.env as unknown as ServerEnv;
		const content = await getContentMarkdownFromURL(env, formData.url);

		const [sumary, title] = await Promise.all([
			formData.generateSummary ? summarizeIntoShortText(env, content) : null,
			formData.generateTitle ? generateTitle(env, content) : null,
		]);

		await updateArticleDatabase(formData.guid, {
			...(sumary && { summary: sumary }),
			...(title && { title }),
		});

		return { sumary, title };
	});
