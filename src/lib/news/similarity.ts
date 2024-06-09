import { DEFAULT_MINIMUM_SIMILARITY_SCORE } from '@/config/api';
import { articles } from '@/db/schema';
import type { ServerEnv } from '@/types/env';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { getDB } from '../db';

/**
 * Drizzle ORM with vector for PostgreSQL
 * Reference: https://orm.drizzle.team/learn/guides/vector-similarity-search
 */

/**
 * Get a list of similar articles based on the text
 */
export async function getSimilarities(env: ServerEnv, embedding: number[]) {
	const similarity = sql<number>`1 - (${cosineDistance(articles.embedding, embedding)})`;

	const similarGuides = await getDB(env.DATABASE_URL)
		.select({ name: articles.title, url: articles.url, similarity })
		.from(articles)
		.where(gt(similarity, 0.5))
		.orderBy((t) => desc(t.similarity))
		.limit(4);

	return similarGuides;
}

export async function isArticleSimilar(
	env: ServerEnv,
	embedding: number[],
	originalContentURL: string,
) {
	/**
	 * Same site would not produce similar articles
	 * This is to prevent the article from same site to be marked as similar
	 */
	const hostOfOriginalContent = new URL(originalContentURL).host;

	const allSimilarities = await getSimilarities(env, embedding);

	// Filter out the original content
	const similarities = allSimilarities.filter(
		(similarity) => new URL(similarity.url).host !== hostOfOriginalContent,
	);

	return {
		result: similarities.some(
			(similarity) => similarity.similarity > DEFAULT_MINIMUM_SIMILARITY_SCORE,
		),

		// Sort by decenting order of similarity
		similarities: similarities.sort((a, b) => b.similarity - a.similarity),
	};
}
