'use server';

import { fetchBookmarks } from '@/app/(auth)/bookmarks/actions';
import { nextServerEnv } from '@/utils/env/server';
import { authActionClient } from '@/utils/safe-action';
import { requestRerankerAPI } from '@ckt1031/ai';
import type { RSS_CATEGORY } from '@ckt1031/config';
import queryString from 'query-string';
import { parseDateRange } from '../get-date-server';
import { fetchNewsForPage } from '../list/fetch';
import type { CacheArticle } from '../list/fetch';
import { SearchSchema } from './schema';

export const searchAction = authActionClient
	.schema(SearchSchema)
	.action(async ({ parsedInput: formData, ctx: { user } }) => {
		// Search for news
		// const documents = formData.documents;

		const articles: Omit<CacheArticle, 'important' | 'category'>[] = [];

		if (formData.isBookmark) {
			const bookmarks = await fetchBookmarks(user);

			articles.push(...bookmarks);
		} else {
			const params = queryString.parse(formData.pageParams ?? '');
			const date = parseDateRange(params);

			const sortedArticles = await fetchNewsForPage({
				category: formData.topic as RSS_CATEGORY,
				date,
			});
			articles.push(...sortedArticles);
		}

		const documents = articles.map((d) => `${d.title}: ${d.summary}`);

		const response = await requestRerankerAPI({
			env: nextServerEnv,
			documents,
			text: formData.searchQuery,
		});

		return response;
	});
