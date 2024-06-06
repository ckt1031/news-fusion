import {
	DEFAULT_EMBEDDING_MODEL,
	DEFAULT_MINIMUM_SIMILARITY_SCORE,
} from '@/config/api';
import { articles } from '@/db/schema';
import type { ServerEnv } from '@/types/env';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { getDB } from '../db';
import { requestEmbeddingsAPI } from '../llm/api';
import { getContentMakrdownFromURL } from './check-rss';

/**
 * Drizzle ORM with vector for PostgreSQL
 * Reference: https://orm.drizzle.team/learn/guides/vector-similarity-search
 */

/**
 * Get a list of similar articles based on the text
 */
export async function getSimilarities(env: ServerEnv, text: string) {
	const embedding = await requestEmbeddingsAPI({
		env,
		text,
		model: DEFAULT_EMBEDDING_MODEL,
	});

	const similarity = sql<number>`1 - (${cosineDistance(articles.embedding, embedding)})`;

	const similarGuides = await getDB(env.DATABASE_URL)
		.select({ name: articles.title, url: articles.url, similarity })
		.from(articles)
		.where(gt(similarity, 0.5))
		.orderBy((t) => desc(t.similarity))
		.limit(4);

	return similarGuides;
}

export async function isArticleSimilar(env: ServerEnv, url: string) {
	const content = await getContentMakrdownFromURL(env, url);

	const similarities = await getSimilarities(env, content);

	return {
		result: similarities.some(
			(similarity) => similarity.similarity > DEFAULT_MINIMUM_SIMILARITY_SCORE,
		),

		// Sort by decenting order of similarity
		similarities: similarities.sort((a, b) => b.similarity - a.similarity),
	};
}
