import * as schema from '@/db/schema';
import type { NewArticle } from '@/db/schema';
import { arrayOverlaps, eq, lt, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import removeTrailingSlash from './remove-trailing-slash';

const client = postgres(process.env.DATABASE_URL ?? '', { prepare: false });

export const db = drizzle(client, { schema });

export async function clearUnusedDatabaseData() {
	// Delete articles that are 30 days old
	await db
		.delete(schema.articles)
		.where(
			lt(
				schema.articles.publishedAt,
				new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
			),
		);
}

export async function checkIfNewsIsNew(
	guid: string,
	url: string,
): Promise<boolean> {
	const result = await db.query.articles.findFirst({
		where: (d, { eq, or }) =>
			or(
				eq(d.guid, guid),
				arrayOverlaps(schema.articles.similarArticles, [url]),
			),
	});

	return !result;
}

export async function addSimilarArticleToDatabase(
	databaseExistedURL: string,
	incomingSimilarURL: string,
) {
	await db
		.update(schema.articles)
		.set({
			similarArticles: sql`array_append(${schema.articles.similarArticles}, ${incomingSimilarURL})`,
		})
		.where(eq(schema.articles.url, databaseExistedURL));
}

export async function createArticleDatabase(data: NewArticle) {
	await db.insert(schema.articles).values(data);
}

export async function updateArticleDatabase(
	url: string,
	data: Partial<NewArticle>,
) {
	await db
		.update(schema.articles)
		.set(data)
		.where(eq(schema.articles.url, removeTrailingSlash(url)));
}

// Date format: YYYY-MM-DD
export async function getNewsBasedOnDateAndCategory(
	date: string,
	category: string,
) {
	const dayStart = new Date(date);

	const oneDay = 24 * 60 * 60 * 1000;
	const dayEnd = new Date(dayStart.getTime() + oneDay);

	return db.query.articles.findMany({
		where: (d, { and, lte, gte }) =>
			and(
				eq(d.category, category),
				gte(schema.articles.publishedAt, dayStart),
				lte(schema.articles.publishedAt, dayEnd),
			),
	});
}
