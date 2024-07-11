import { TargetLanguageToLLM, availableFrontendCallModels } from '@/config/api';
import { z } from 'zod';

function checkLLMModelValue(value: string) {
	const allValues = Object.values(availableFrontendCallModels).map(
		({ value }) => value,
	);
	return allValues.includes(value);
}

export const GenerateContentActionSchema = z.object({
	url: z.string().url(),
	guid: z.string(),

	generateSummary: z.boolean().optional(),
	generateTitle: z.boolean().optional(),

	// availableFrontendCallModels { value: string; label: string; }[]
	// Validated by LLMSelect

	llmModel: z
		.string()
		.refine(checkLLMModelValue, 'Invalid LLM model')
		.optional(),
});

function getZodEnumFromObjectKeys<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	TI extends Record<string, any>,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	R extends string = TI extends Record<infer R, any> ? R : never,
>(input: TI): z.ZodEnum<[R, ...R[]]> {
	const [firstKey, ...otherKeys] = Object.keys(input) as [R, ...R[]];
	return z.enum([firstKey, ...otherKeys]);
}

export const TranslateActionSchema = z.object({
	title: z.string(),
	summary: z.string(),
	useCache: z.boolean().optional(),
	targetLanguage: getZodEnumFromObjectKeys(TargetLanguageToLLM),
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
