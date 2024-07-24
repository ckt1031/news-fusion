import { z } from 'zod';

export const checkImportanceSchema = z.object({
	url: z.string().url().optional(),
	content: z.string().optional(),
});
