import type { articles } from './schema.js';

export type Article = typeof articles.$inferSelect;
