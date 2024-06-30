import { z } from 'zod';

export const SaveSharedArticleSchema = z.object({
	articleId: z.number(),
	longSummary: z.string().min(1),
	thumbnail: z.string().optional(),
	sources: z.array(z.string()).optional(),
});
