import * as schema from '@/db/schema';
import type { NewArticle } from '@/db/schema';
import type { ServerEnv } from '@/types/env';
import { arrayOverlaps, eq, lt, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import removeTrailingSlash from './remove-trailing-slash';

export function getDB(connectionString: string) {
	const client = postgres(connectionString, { prepare: false });
	return drizzle(client, { schema });
}

export async function clearUnusedDatabaseData(env: ServerEnv) {
	const db = getDB(env.DATABASE_URL);

	// Delete articles that are 7 days old
	await db.delete(schema.articles).where(
		// 604800000 = 7 days
		lt(schema.articles.publishedAt, new Date(Date.now() - 604800000)),
	);
}

export async function checkIfNewsIsNew(
	env: ServerEnv,
	guid: string,
): Promise<boolean> {
	const db = getDB(env.DATABASE_URL);

	const result = await db.query.articles.findFirst({
		// with: { url },
		where: (d, { eq }) =>
			or(
				eq(d.guid, removeTrailingSlash(guid)),
				arrayOverlaps(schema.articles, [guid]),
			),
	});

	return !result;
}

export async function createArticleDatabase(env: ServerEnv, data: NewArticle) {
	const db = getDB(env.DATABASE_URL);

	await db.insert(schema.articles).values(data);
}

export async function updateArticleDatabase(
	env: ServerEnv,
	url: string,
	data: Partial<NewArticle>,
) {
	const db = getDB(env.DATABASE_URL);

	await db
		.update(schema.articles)
		.set(data)
		.where(eq(schema.articles.url, removeTrailingSlash(url)));
}
