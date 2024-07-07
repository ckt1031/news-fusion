import { z } from 'zod';

export const SearchSchema = z.object({
	searchQuery: z.string().min(3),
	pageParams: z.string().optional(),
	topic: z.string().optional(),
	isBookmark: z.boolean().optional(),
});
