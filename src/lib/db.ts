import { lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import type { ServerEnv } from '../types/env';

export function getDB(db: D1Database) {
	return drizzle(db, { schema });
}

export async function clearUnused(env: ServerEnv) {
	const db = getDB(env.D1);

	// Delete articles that are 7 days old
	await db.delete(schema.articles).where(
		// Milliseconds in a week
		lt(schema.articles.publishedAt, Date.now() - 604800000),
	);
}
