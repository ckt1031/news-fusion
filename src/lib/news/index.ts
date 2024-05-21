import type { NewArticle } from '@/db/schema';
import type { ServerEnv } from '@/types/env';
import { nanoid } from 'nanoid';
import { createArticleDatabase } from '../db';
import checkMustRead from './check-must-read';

type CheckNewsProps = {
	doNotCheckMustRead?: boolean;
	doNotCheckAiFilter?: boolean;
};

export async function checkNews(env: ServerEnv, props?: CheckNewsProps) {
	// Handle Must Read RSS
	if (!props?.doNotCheckMustRead) {
		await checkMustRead(env);
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
