import { z } from 'zod';

export const GenerateContentActionSchema = z.object({
	url: z.string().url(),
	guid: z.string(),

	generateSummary: z.boolean().optional(),
	generateTitle: z.boolean().optional(),
});

export const supportedTargetLanguages = ['zh-tw', 'zh-cn', 'en'] as const;

export const TranslateActionSchema = z.object({
	title: z.string(),
	summary: z.string(),
	useCache: z.boolean().optional(),
	targetLanguage: z.enum(supportedTargetLanguages),
});

export const ClearTopicNewsCacheActionSchema = z.object({
	date: z.string().optional(),
	topic: z.string(),
	from: z.string().optional(),
	to: z.string().optional(),
});

export const BookmarkActionSchema = z.object({
	articleId: z.number(),
});
