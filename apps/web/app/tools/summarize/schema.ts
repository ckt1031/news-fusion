import { z } from 'zod';

export const SummarizeSchema = z.object({
	content: z.string(),
	webSearch: z.boolean().optional().default(false),
});

export type WebSearchResult = {
	query: string;
	urls: string[];
};
