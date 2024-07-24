import {
	AVAILABLE_CONTENT_GENERATION_MODELS,
	TargetLanguageToLLM,
} from '@ckt1031/config';
import { z } from 'zod';

type ModelList = {
	label: string;
	value: string;
}[];

function checkLLMValue(list: ModelList, value: string) {
	const allValues = Object.values(list).map(({ value }) => value);
	return allValues.includes(value);
}

function getZodEnumFromObjectKeys<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	TI extends Record<string, any>,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	R extends string = TI extends Record<infer R, any> ? R : never,
>(input: TI): z.ZodEnum<[R, ...R[]]> {
	const [firstKey, ...otherKeys] = Object.keys(input) as [R, ...R[]];
	return z.enum([firstKey, ...otherKeys]);
}

export const GenerateContentActionSchema = z.object({
	url: z.string().url(),
	guid: z.string(),

	catagory: z.string(),

	generateSummary: z.boolean().optional(),
	generateTitle: z.boolean().optional(),

	// availableFrontendCallModels { value: string; label: string; }[]
	// Validated by LLMSelect
	llmModel: z
		.string()
		.refine(
			(v) => checkLLMValue(AVAILABLE_CONTENT_GENERATION_MODELS, v),
			'Invalid LLM model',
		)
		.optional(),
});

export const TranslateActionSchema = z.object({
	title: z.string(),
	summary: z.string(),
	useCache: z.boolean().optional(),
	targetLanguage: getZodEnumFromObjectKeys(TargetLanguageToLLM),
	llmModel: z
		.string()
		.refine(
			(v) => checkLLMValue(AVAILABLE_CONTENT_GENERATION_MODELS, v),
			'Invalid LLM model',
		)
		.optional(),
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
