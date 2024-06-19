import { z } from 'zod';

export const similaritySchema = z.object({
	url: z.string().url().optional(),
	content: z.string().min(1).optional(),
	noSameDomain: z.boolean().default(false),
});
