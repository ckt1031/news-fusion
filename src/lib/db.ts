import * as schema from '@/db/schema';
import type { NewArticle } from '@/db/schema';
import { arrayOverlaps, eq, lt, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

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

interface CheckNewsExistance {
	guid: string;
	url: string;
	title: string;
}

export async function checkIfNewsIsNew(
	props: CheckNewsExistance,
): Promise<boolean> {
	const result = await db.query.articles.findFirst({
		where: (d, { eq, or }) =>
			or(
				eq(d.guid, props.guid),
				eq(d.url, props.url),
				eq(d.title, props.title),
				arrayOverlaps(d.similarArticles, [props.url]),
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
	guid: string,
	data: Partial<NewArticle>,
) {
	await db
		.update(schema.articles)
		.set(data)
		.where(eq(schema.articles.guid, guid));
}

// Date format: YYYY-MM-DD
export async function getNewsBasedOnDateAndCategory(
	date: string,
	category: string,
	important: boolean,
) {
	const oneDay = 24 * 60 * 60 * 1000;
	const HKGOffset = 8 * 60 * 60 * 1000;
	const dayStart = new Date(new Date(date).getTime() - HKGOffset);

	const dayEnd = new Date(dayStart.getTime() + oneDay);

	return db.query.articles.findMany({
		where: (d, { and, gte, lte }) =>
			and(
				eq(d.category, category),
				gte(d.publishedAt, dayStart),
				lte(d.publishedAt, dayEnd),
				...(important ? [eq(d.important, important)] : []),
			),
	});
}
