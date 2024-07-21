import { RSS_CATEGORY } from '@ckt1031/config';
import { getSHA256 } from '@ckt1031/utils';
import { and, arrayOverlaps, eq, lt, or, sql } from 'drizzle-orm';
import { redis } from '../../cache/src/redis';
import { db } from './client';
import * as schema from './schema';
import type { NewArticle } from './schema';

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
}

export async function checkIfNewsIsNew(
	props: CheckNewsExistance,
): Promise<boolean> {
	const cacheKey = getSHA256(props.guid + props.url);

	// Check if the article already exists
	const exist = await redis.exists(cacheKey);

	if (exist) return false;

	const result = await db.query.articles.findFirst({
		where: (d, { eq, or }) =>
			or(
				eq(d.guid, props.guid),
				eq(d.url, props.url),
				arrayOverlaps(d.similarArticles, [props.url]),
			),
		columns: {
			id: true,
		},
	});

	if (result) {
		await redis.set(cacheKey, '1', {
			// Expire in 1 day
			ex: 60 * 60 * 24,
		});

		return false;
	}

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
		.delete(schema.bookmarks)
		.where(
			and(
				eq(schema.bookmarks.userId, userId),
				eq(schema.bookmarks.articleId, articleId),
			),
		);
}

export async function addArticleUserRelation(
	userId: string,
	articleId: number,
) {
	// Find if the relation already exists
	const result = await db.query.bookmarks.findFirst({
		where: (d, { and, eq }) =>
			and(eq(d.userId, userId), eq(d.articleId, articleId)),
	});

	if (result) return AddArticleUserRelationStatus.AlreadyExists;

	await db.insert(schema.bookmarks).values({
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
	//important: boolean,
) {
	const oneDay = 24 * 60 * 60 * 1000;

	// TODO: This should be dynamic, fix this later
	const HKGOffset = 0; // 8 * 60 * 60 * 1000;

	const dayStart = new Date(
		new Date(typeof date !== 'string' ? date.from : date).getTime() - HKGOffset,
	);

	const dayEnd =
		typeof date === 'string'
			? new Date(dayStart.getTime() + oneDay)
			: new Date(new Date(date.to).getTime() - HKGOffset);

	return db.query.articles.findMany({
		columns: {
			id: true,
			guid: true,
			title: true,
			url: true,
			summary: true,
			publisher: true,
			similarArticles: true,
			publishedAt: true,
			longSummary: true,
			category: true,
			thumbnail: true,
		},
		orderBy: (d, { desc }) => [desc(d.publishedAt)],
		where: (d, { and, gte, lte }) =>
			and(
				// eq(d.category, category),
				...(category !== RSS_CATEGORY.ALL ? [eq(d.category, category)] : []),

				//...(important ? [eq(d.important, important)] : []),
				eq(d.important, true),

				// Time
				gte(d.publishedAt, dayStart),
				lte(d.publishedAt, dayEnd),
			),
	});
}

export async function getBookmarksFromUser(userId: string) {
	const data = await db.query.bookmarks.findMany({
		where: (d, { eq }) => eq(d.userId, userId),
		orderBy: (d, { desc }) => [desc(d.createdAt)],
		with: {
			article: {
				columns: {
					id: true,
					guid: true,
					title: true,
					url: true,
					summary: true,
					publisher: true,
					publishedAt: true,
					similarArticles: true,
					longSummary: true,
					thumbnail: true,
					category: true,
				},
			},
		},
	});

	return data.sort(
		(a, b) => b.article.publishedAt.getTime() - a.article.publishedAt.getTime(),
	);
}

export async function fetchArticle(articleId: number) {
	return db.query.articles.findFirst({
		where: (d, { eq }) => eq(d.id, articleId),
		columns: {
			id: true,
			guid: true,
			title: true,
			url: true,
			summary: true,
			publisher: true,
			publishedAt: true,
			similarArticles: true,
			longSummary: true,
			thumbnail: true,
		},
	});
}
