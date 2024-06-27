import { z } from 'zod';

export const GenerateContentActionSchema = z.object({
	url: z.string().url(),
	guid: z.string(),

	generateSummary: z.boolean().optional(),
	generateTitle: z.boolean().optional(),
});

export const supportedTargetLanguages = ['zh-tw', 'en'] as const;

export const TranslateActionSchema = z.object({
	title: z.string(),
	summary: z.string(),
	targetLanguage: z.enum(supportedTargetLanguages),
});

export const clearCacheActionSchema = z.object({
	date: z.string(),
	topic: z.string(),
	from: z.string().optional(),
	to: z.string().optional(),
});

export const BookmarkActionSchema = z.object({
	articleId: z.number(),
});
