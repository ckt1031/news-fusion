import { DEFAULT_MINIMUM_SIMILARITY_SCORE } from '@ckt1031/config';
import { articles, db } from '@ckt1031/db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';

/**
 * Drizzle ORM with vector for PostgreSQL
 * Reference: https://orm.drizzle.team/learn/guides/vector-similarity-search
 */

/**
 * Get a list of similar articles based on the text
 */
export async function getSimilarities(embedding: number[]) {
	const similarity = sql<number>`1 - (${cosineDistance(articles.embedding, embedding)})`;

	const similarGuides = db
		.select({ name: articles.title, url: articles.url, similarity })
		.from(articles)
		.where(gt(similarity, DEFAULT_MINIMUM_SIMILARITY_SCORE))
		.orderBy((t) => desc(t.similarity))
		.limit(4);

	return similarGuides;
}

interface SimilarArticleProp {
	result: boolean;
	similarities: {
		name: string;
		url: string;
		similarity: number;
	}[];
}

export async function isArticleSimilar(
	embedding: number[],
	/**
	 * If the original content URL is provided, content from the same site will not be marked as similar
	 */
	originalContentURL?: string,
): Promise<SimilarArticleProp> {
	/**
	 * Same site would not produce similar articles
	 * This is to prevent the article from same site to be marked as similar
	 */
	const hostOfOriginalContent = originalContentURL
		? new URL(originalContentURL).host
		: '';

	const allSimilarities = await getSimilarities(embedding);

	// Filter out the original content
	const similarities = allSimilarities.filter(
		(similarity) => new URL(similarity.url).host !== hostOfOriginalContent,
	);

	return {
		result: similarities.length > 0,

		// Sort by decenting order of similarity
		similarities: similarities,
	};
}
