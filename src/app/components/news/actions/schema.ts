import { z } from 'zod';

export const ReGenSummaryActionSchema = z.object({
	url: z.string().url(),
	guid: z.string(),
	date: z.string(),
	topic: z.string(),
});

export const TranslateActionSchema = z.object({
	title: z.string(),
	summary: z.string(),
});
