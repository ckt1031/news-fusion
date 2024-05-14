import { lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import removeTrailingSlash from 'remove-trailing-slash';
import * as schema from '../db/schema';
import type { NewArticle } from '../db/schema';
import type { ServerEnv } from '../types/env';

export function getDB(db: D1Database) {
	return drizzle(db, { schema });
}

export async function clearUnusedDatabaseData(env: ServerEnv) {
	const db = getDB(env.D1);

	// Delete articles that are 7 days old
	await db.delete(schema.articles).where(
		// Milliseconds in a week
		lt(schema.articles.publishedAt, Date.now() - 604800000),
	);
}

export async function checkIfNewsIsNew(env: ServerEnv, guid: string) {
	const db = getDB(env.D1);

	const result = await db.query.articles.findFirst({
		// with: { url },
		where: (d, { eq }) => eq(d.guid, removeTrailingSlash(guid)),
	});

	return !result;
}

export async function createArticleDatabase(env: ServerEnv, data: NewArticle) {
	const db = getDB(env.D1);

	await db.insert(schema.articles).values(data);
}
