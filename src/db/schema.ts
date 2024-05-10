import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey().unique(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  publisher: text("publisher").notNull(),
  category: text("category").notNull(),

  // Unix Timestamp
  publishedAt: integer("publishedAt").notNull(),
});

export const checkedArticles = sqliteTable("checked_articles", {
  id: text("id").primaryKey().unique(),
  url: text("url").notNull(),
  publisher: text("publisher").notNull(),
  // Unix Timestamp
  publishedAt: integer("publishedAt").notNull(),
});
