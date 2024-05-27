import { AI_FILTER_RSS_LINKS, MUST_READ_RSS_LIST } from '@/config/news-sources';
import type { NewArticle } from '@/db/schema';
import type { ServerEnv } from '@/types/env';
import { nanoid } from 'nanoid';
import { createArticleDatabase } from '../db';
import checkRSS from './check-rss';

type CheckNewsProps = {
	doNotCheckMustRead?: boolean;
	doNotCheckAiFilter?: boolean;
};

export async function checkNews(env: ServerEnv, props?: CheckNewsProps) {
	if (!props?.doNotCheckMustRead) {
		// Handle Must Read RSS
		await checkRSS({
			env,
			list: MUST_READ_RSS_LIST,
			allMustRead: true,
		});
	}

	if (!props?.doNotCheckAiFilter) {
		// Handle AI Filter RSS
		await checkRSS({
			env,
			list: AI_FILTER_RSS_LINKS,
			allMustRead: false,
		});
	}
}

export async function saveArticle(
	env: ServerEnv,
	news: Omit<NewArticle, 'id'>,
) {
	await createArticleDatabase(env, {
		id: nanoid(),
		...news,
	});
}
