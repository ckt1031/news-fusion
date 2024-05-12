import { z } from 'zod';

export const NewsMinimalistArticle = z.object({
	id: z.string(),
	url: z.string(),
	title: z.string(),
	rating: z.number(),
	source: z.string(),
	category: z.string(),
	created_at: z.string(),
	title_rewritten: z.string(),
});

export const NewsMinimalistCategory = z.object({
	id: z.string(),
	article_count: z.number(),
	is_trending: z.boolean(),
	articles: z.array(NewsMinimalistArticle),
});

export const NewsMinimalistResponse = z.array(NewsMinimalistCategory);

export type NewsMinimalistArticleType = z.infer<typeof NewsMinimalistArticle>;
export type NewsMinimalistCategoryType = z.infer<typeof NewsMinimalistCategory>;
export type NewsMinimalistResponseType = z.infer<typeof NewsMinimalistResponse>;
