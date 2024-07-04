import { z } from 'zod';

export const envSchema = z.object({
	// AI LLM and Embedding API
	OPENAI_API_BASE_URL: z.string().optional(),
	OPENAI_API_KEY: z.string(),

	// RSS Combination API, to fetch social media feeds like X (Twitter)
	RSSHUB_BASE_URL: z.string().optional(),
	RSSHUB_ACCESS_KEY: z.string().optional(),

	// Private API
	TOOLS_API_BASE_URL: z.string(),
	TOOLS_API_KEY: z.string(),

	// Database URL
	DATABASE_URL: z.string(),

	// Some Default AI Model IDs, optional
	DEFAULT_SUMMARIZE_MODEL: z.string().optional(),
	DEFAULT_TRANSLATE_MODEL: z.string().optional(),
	DEFAULT_TITLE_GENERATE_MODEL: z.string().optional(),
	DEFAULT_CHECK_IMPORTANCE_MODEL: z.string().optional(),
	DEFAULT_SEARCH_QUERY_GENERATE_MODEL: z.string().optional(),

	// RERANKER API
	RERANKER_API_BASE_URL: z.string().optional(),
	RERANKER_API_KEY: z.string().optional(),
	RERANKER_MODEL: z.string().optional(),

	// Redis URL
	UPSTASH_REDIS_REST_URL: z.string(),
	UPSTASH_REDIS_REST_TOKEN: z.string(),
});

export type ServerEnv = z.infer<typeof envSchema>;
