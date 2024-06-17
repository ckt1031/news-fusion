import { z } from 'zod';

export const ReGenSummaryActionSchema = z.object({
	url: z.string().url(),
	guid: z.string(),
	date: z.string(),
	topic: z.string(),
});

export const supportedTargetLanguages = ['zh-tw', 'en'] as const;

export const TranslateActionSchema = z.object({
	title: z.string(),
	summary: z.string(),
	targetLanguage: z.enum(supportedTargetLanguages),
	useLLM: z.boolean(),
});

export const clearCacheActionSchema = z.object({
	date: z.string(),
	topic: z.string(),
});
