import { z } from 'zod';

export const UnifiedNewsArticleSchema = z.object({
	url: z.string(),
	title: z.string(),
	publisher: z.string(),
	category: z.string(),

	// Use a unified timezone for all dates: UTC+0
	publishedAt: z.string(),
});
