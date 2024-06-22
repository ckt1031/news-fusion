import { z } from 'zod';

export const summarizeSchema = z.object({
	content: z.string().min(1),
	webSearch: z.boolean().optional().default(false),
});

export type WebSearchResult = {
	query: string;
	urls: string[];
};
