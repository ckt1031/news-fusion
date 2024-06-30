import * as schema from '@/db/schema';
import type { NewArticle } from '@/db/schema';
import { createPool } from '@vercel/postgres';
import { and, arrayOverlaps, eq, lt, or, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/vercel-postgres';

const client = createPool({
	connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(client, {
	schema,
});

export async function clearUnusedDatabaseData() {
	const day = 24 * 60 * 60 * 1000;
	// Delete articles that are 30 days old
	await db.delete(schema.articles).where(
		or(
			// Delete articles that are not important and are 20 days old
			and(
				lt(schema.articles.publishedAt, new Date(Date.now() - 20 * day)),
				eq(schema.articles.important, false),
			),
			// Delete articles that are 90 days old
			lt(schema.articles.publishedAt, new Date(Date.now() - 90 * day)),
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

export enum AddArticleUserRelationStatus {
	AlreadyExists = 1,
	Success = 2,
}

export async function removeArticleUserRelation(
	userId: string,
	articleId: number,
) {
	await db
		.delete(schema.usersToArticles)
		.where(
			and(
				eq(schema.usersToArticles.userId, userId),
				eq(schema.usersToArticles.articleId, articleId),
			),
		);
}

export async function addArticleUserRelation(
	userId: string,
	articleId: number,
) {
	// Find if the relation already exists
	const result = await db.query.usersToArticles.findFirst({
		where: (d, { and, eq }) =>
			and(eq(d.userId, userId), eq(d.articleId, articleId)),
	});

	if (result) return AddArticleUserRelationStatus.AlreadyExists;

	await db.insert(schema.usersToArticles).values({
		articleId,
		userId,
	});

	return AddArticleUserRelationStatus.Success;
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
	date:
		| string
		| {
				to: string;
				from: string;
		  },
	category: string,
	important: boolean,
) {
	const oneDay = 24 * 60 * 60 * 1000;
	const HKGOffset = 8 * 60 * 60 * 1000;

	const dayStart = new Date(
		new Date(typeof date !== 'string' ? date.from : date).getTime() - HKGOffset,
	);

	const dayEnd =
		typeof date === 'string'
			? new Date(dayStart.getTime() + oneDay)
			: new Date(new Date(date.to).getTime() - HKGOffset);

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

export async function getBookmarksFromUser(userId: string) {
	const data = await db.query.usersToArticles.findMany({
		where: (d, { eq }) => eq(d.userId, userId),
		with: {
			article: true,
		},
	});

	return data.sort(
		(a, b) => b.article.publishedAt.getTime() - a.article.publishedAt.getTime(),
	);
}

export async function getSharedArticle(id: string) {
	return db.query.sharedArticles.findFirst({
		where: (d, { eq }) => eq(d.id, id),
		with: {
			article: true,
		},
	});
}

export async function deleteSharedArticle(id: string) {
	await db
		.delete(schema.sharedArticles)
		.where(eq(schema.sharedArticles.id, id));
}

export async function saveSharedArticle(data: schema.NewSharedArticle) {
	await db.insert(schema.sharedArticles).values(data);
}

export async function fetchArticle(articleId: number) {
	return db.query.articles.findFirst({
		where: (d, { eq }) => eq(d.id, articleId),
	});
}
