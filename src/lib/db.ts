import * as schema from '@/db/schema';
import type { NewArticle } from '@/db/schema';
import type { CheckArticleRequest, CreateArticleRequest } from '@/server/db';
import type { ServerEnv } from '@/types/env';
import { lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { hc } from 'hono/client';
import removeTrailingSlash from './remove-trailing-slash';

export function getDB(db: D1Database) {
	return drizzle(db, { schema });
}

function getWorkerHonoHost<T>(env: ServerEnv) {
	// @ts-ignore
	return hc<T>(`${env.WORKER_BASE_URL ?? 'http://localhost:8787'}/db`, {
		headers: {
			Authorization: `Bearer ${env.WORKER_API_KEY}`,
		},
	});
}

export async function clearUnusedDatabaseData(env: ServerEnv) {
	if (!env.D1) throw new Error('D1 database is not available');

	const db = getDB(env.D1);

	// Delete articles that are 7 days old
	await db.delete(schema.articles).where(
		// Milliseconds in a week
		lt(schema.articles.publishedAt, Date.now() - 604800000),
	);
}

export async function checkIfNewsIsNew(
	env: ServerEnv,
	guid: string,
): Promise<boolean> {
	if (!env.D1) {
		const client = getWorkerHonoHost<CheckArticleRequest>(env);
		const res = await client['check-article-is-new'].$post({
			json: { url: guid },
		});

		return (await res.json()).isNew;
	}

	const db = getDB(env.D1);

	const result = await db.query.articles.findFirst({
		// with: { url },
		where: (d, { eq }) => eq(d.guid, removeTrailingSlash(guid)),
	});

	return !result;
}

export async function createArticleDatabase(env: ServerEnv, data: NewArticle) {
	if (!env.D1) {
		const client = getWorkerHonoHost<CreateArticleRequest>(env);
		await client['create-article'].$put({
			json: data,
		});
		return;
	}

	const db = getDB(env.D1);

	await db.insert(schema.articles).values(data);
}
