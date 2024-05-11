import { text, integer, sqliteTable, } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey().unique(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  publisher: text("publisher").notNull(),
  category: text("category").notNull(),

  // Unix Timestamp
  publishedAt: integer("publishedAt").notNull(),

  importantEnough: integer('id', { mode: 'boolean' }).notNull(),
});

export type NewArticle = typeof articles.$inferInsert;