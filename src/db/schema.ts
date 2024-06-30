import { relations, sql } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	vector,
} from 'drizzle-orm/pg-core';

export const articles = pgTable(
	'articles',
	{
		id: serial('id').primaryKey().unique(),
		url: text('url').notNull().unique(),
		guid: text('guid').notNull().unique(),
		title: text('title').notNull().unique(),
		publisher: text('publisher').notNull(),
		category: text('category').notNull(),
		publishedAt: timestamp('publishedAt', { mode: 'date' }).notNull(),

		important: boolean('important').notNull(),

		// OpenAI: text-embedding-3-small
		embedding: vector('embedding', { dimensions: 1536 }),

		similarArticles: text('similarArticles').array().notNull(),

		summary: text('summary').notNull().default(sql`''`),
	},
	(table) => ({
		embeddingIndex: index('embeddingIndex').using(
			'hnsw',
			table.embedding.op('vector_cosine_ops'),
		),
		// More indexes
		guidIndex: index('guidIndex').on(table.guid),
		titleIndex: index('titleIndex').on(table.title),
		urlIndex: index('urlIndex').on(table.url),
	}),
);

export const users = pgTable(
	'users',
	{
		id: text('id').primaryKey().unique(),
		role: integer('role').notNull(),
	},
	(table) => ({
		userIdIndex: index('userIdIndex').on(table.id),
	}),
);

export const sharedArticles = pgTable(
	'shared_articles',
	{
		id: text('id').primaryKey().unique(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		articleId: integer('article_id')
			.notNull()
			.references(() => articles.id),
		longSummary: text('longSummary').notNull(),
		thumbnail: text('thumbnail'),
		sources: text('sources').array(),
	},
	(table) => ({
		sharedArticlesIdIndex: index('sharedArticlesIdIndex').on(table.userId),
	}),
);

/**
 * Relations
 */

export const sharedArticlesRelations = relations(sharedArticles, ({ one }) => ({
	article: one(articles, {
		fields: [sharedArticles.articleId],
		references: [articles.id],
	}),
	user: one(users, {
		fields: [sharedArticles.userId],
		references: [users.id],
	}),
}));

export const usersRelations = relations(users, ({ many }) => ({
	usersToArticles: many(usersToArticles),
}));

export const articlesRelations = relations(articles, ({ many }) => ({
	usersToArticles: many(usersToArticles),
}));

export const usersToArticles = pgTable(
	'users_to_articles',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		articleId: integer('article_id')
			.notNull()
			.references(() => articles.id),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.articleId] }),
	}),
);

export const usersToArticlesRelations = relations(
	usersToArticles,
	({ one }) => ({
		article: one(articles, {
			fields: [usersToArticles.articleId],
			references: [articles.id],
		}),
		user: one(users, {
			fields: [usersToArticles.userId],
			references: [users.id],
		}),
	}),
);

export type NewArticle = typeof articles.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewSharedArticle = typeof sharedArticles.$inferInsert;
