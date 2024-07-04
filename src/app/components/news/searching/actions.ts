'use server';

import { nextServerEnv } from '@/app/utils/env/server';
import { authActionClient } from '@/app/utils/safe-action';
import { requestRerankerAPI } from '@/lib/llm/api';
import { SearchSchema } from './schema';

export const searchAction = authActionClient
	.schema(SearchSchema)
	.action(async ({ parsedInput: formData }) => {
		// Search for news
		const documents = formData.documents;

		const response = await requestRerankerAPI({
			env: nextServerEnv,
			documents,
			text: formData.search,
		});

		return response;
	});
