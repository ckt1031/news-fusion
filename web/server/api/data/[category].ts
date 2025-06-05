import dayjs from 'dayjs';
import { desc, gte, lt } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import z from 'zod';
import { RSS_CATEGORIES } from '~~/config/sources';
import { db } from '~~/db';
import { articles } from '~~/db/schema';

export function isCategoryValid(category: string) {
	return RSS_CATEGORIES.some((c) => c.id === category);
}

const querySchema = z.object({
	date: z.string().optional(),
});

/**
 * Oriented for internal nuxt use
 */
export default defineEventHandler(async (event) => {
	const category = getRouterParam(event, 'category') as string;

	// If category is not valid, return 400
	if (!isCategoryValid(category)) {
		return {
			error: 'Invalid category',
		};
	}

	// Get date query parameter
	const queries = await getValidatedQuery(event, (q) => querySchema.parse(q));
	const date = queries.date ?? dayjs().format('YYYY-MM-DD');

	// Get the category data
	const categoryData = RSS_CATEGORIES.find((c) => c.id === category);

	// Below will never happen, but just in case
	// And makes TypeScript happy
	if (!categoryData) {
		return {
			error: 'Category not found',
		};
	}

	try {
		const queriedArticles = await db
			.select()
			.from(articles)
			.where(
				and(
					eq(articles.category, category),
					// Date range, from start of the day to end of the day
					gte(articles.publishedAt, dayjs(date).startOf('day').toDate()),
					lt(articles.publishedAt, dayjs(date).endOf('day').toDate()),
				),
			)
			.limit(150)
			.orderBy(desc(articles.publishedAt));

		return {
			error: null,
			articles: queriedArticles,
		};
	} catch (error) {
		console.error(error);

		// If error, return empty array
		return {
			error: 'Failed to fetch articles',
			articles: [],
		};
	}
});
