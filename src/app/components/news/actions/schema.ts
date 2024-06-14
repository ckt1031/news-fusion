import { z } from 'zod';

export const ReGenSummaryActionSchema = z.object({
	url: z.string().url(),
	guid: z.string(),
	date: z.string(),
	topic: z.string(),
});
