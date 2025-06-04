import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const articles = pgTable('articles', {
	/**
	 * Unique integer identifier for the article in the database.
	 */
	id: integer().unique().primaryKey().generatedAlwaysAsIdentity(),

	/**
	 * The unique identifier for the article.
	 */
	guid: text('guid').notNull(),

	link: text('link').notNull(),

	title: text('title').notNull(),
	summary: text('summary').notNull(),
	thumbnail: text('thumbnail'),

	/**
	 * Classify the article into a category for better grouping.
	 */
	category: text('category').notNull(),

	/**
	 * The date and time the article was published.
	 */
	publishedAt: timestamp('published_at', {
		withTimezone: true,
	}).notNull(),

	/**
	 * The time the database entry was created.
	 */
	createdAt: timestamp('created_at', {
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),

	/**
	 * The name of the publisher of the article.
	 */
	publisher: text('publisher').notNull(),
});
