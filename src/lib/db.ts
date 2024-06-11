import * as schema from '@/db/schema';
import type { NewArticle } from '@/db/schema';
import { arrayOverlaps, eq, lt, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import removeTrailingSlash from './remove-trailing-slash';

const client = postgres(process.env.DATABASE_URL ?? '', { prepare: false });

export const db = drizzle(client, { schema });

export async function clearUnusedDatabaseData() {
	// Delete articles that are 7 days old
	await db.delete(schema.articles).where(
		// 604800000 = 7 days
		lt(schema.articles.publishedAt, new Date(Date.now() - 604800000)),
	);
}

export async function checkIfNewsIsNew(guid: string): Promise<boolean> {
	const result = await db.query.articles.findFirst({
		where: (d, { eq, or }) =>
			or(
				eq(d.guid, guid),
				arrayOverlaps(schema.articles.similarArticles, [guid]),
			),
	});

	return !result;
}

export async function addSimilarArticleToDatabase(
	url: string,
	similarUrl: string,
) {
	await db
		.update(schema.articles)
		.set({
			similarArticles: sql`array_append(${schema.articles.similarArticles}, ${similarUrl})`,
		})
		.where(eq(schema.articles.url, url));
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
