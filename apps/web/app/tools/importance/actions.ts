'use server';

import { nextServerEnv } from '@/utils/env/server';
import { getContentMarkdownParallel } from '@/utils/get-urls';
import { authActionClient } from '@/utils/safe-action';
import { checkArticleImportance } from '@ckt1031/ai';
import { checkImportanceSchema } from './schema';

export const checkImportanceAction = authActionClient
	.schema(checkImportanceSchema)
	.action(async ({ parsedInput: formData }) => {
		const url = formData.url;

		let content = '';

		if (url) {
			const fetchedContent = (
				await getContentMarkdownParallel(nextServerEnv, [url])
			)[0];

			if (!fetchedContent || fetchedContent.content.length === 0) {
				throw new Error(`Failed to fetch content for ${url}`);
			}

			content = fetchedContent.content;
		} else if (formData.content) {
			content = formData.content;
		}

		return await checkArticleImportance(nextServerEnv, content);
	});
