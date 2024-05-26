import type { NewArticle } from '@/db/schema';
import type { ServerEnv } from '@/types/env';
import { nanoid } from 'nanoid';
import { createArticleDatabase } from '../db';
import aiCheckFilter from './ai-filter-news';
import checkMustRead from './check-must-read';

type CheckNewsProps = {
	doNotCheckMustRead?: boolean;
	doNotCheckAiFilter?: boolean;
};

export async function checkNews(env: ServerEnv, props?: CheckNewsProps) {
	if (!props?.doNotCheckMustRead) {
		// Handle Must Read RSS
		await checkMustRead(env);
	}

	if (!props?.doNotCheckAiFilter) {
		// Handle AI Filter RSS
		await aiCheckFilter(env);
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
