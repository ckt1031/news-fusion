import {
	boolean,
	pgTable,
	serial,
	text,
	timestamp,
	vector,
	index,
} from 'drizzle-orm/pg-core';

export const articles = pgTable('articles', {
	id: serial('id').primaryKey(),
	url: text('url').notNull(),
	guid: text('guid').notNull(),
	title: text('title').notNull(),
	publisher: text('publisher').notNull(),
	category: text('category').notNull(),
	publishedAt: timestamp('publishedAt', { mode: 'date' }).notNull(),
	important: boolean('important').notNull(),

	// OpenAI: text-embedding-3-small
	embedding: vector('embedding', { dimensions: 1536 }).notNull(),
},
(table) => ({
	embeddingIndex: index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops')),
}));

export type NewArticle = typeof articles.$inferInsert;
