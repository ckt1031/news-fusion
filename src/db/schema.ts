import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';

export const articles = sqliteTable('articles', {
	id: text('id').primaryKey().unique(),
	title: text('title').notNull(),
	url: text('url').notNull(),
	publisher: text('publisher').notNull(),
	category: text('category').notNull(),

	guid: text('guid').notNull(),

	publishedAt: integer('publishedAt').notNull(),

	importantEnough: integer('id', { mode: 'boolean' }).notNull(),
});

export type NewArticle = typeof articles.$inferInsert;
export const NewArticleSchema = createInsertSchema(articles);
