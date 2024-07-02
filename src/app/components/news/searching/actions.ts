'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { requestRerankerAPI } from '@/lib/llm/api';
import type { ServerEnv } from '@/types/env';
import { SearchSchema } from './schema';

export const searchAction = authActionClient
	.schema(SearchSchema)
	.action(async ({ parsedInput: formData }) => {
		// Search for news
		const documents = formData.documents;
		const env = process.env as unknown as ServerEnv;

		const response = await requestRerankerAPI({
			env,
			documents,
			text: formData.search,
		});

		return response;
	});
