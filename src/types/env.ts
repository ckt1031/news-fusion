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

	// Sentry DSN, error tracking
	SENTRY_DSN: z.string().optional(),

	// // LangFuse API, LLM tracing platform
	// LANGFUSE_SECRET_KEY: z.string().optional(),
	// LANGFUSE_PUBLIC_KEY: z.string().optional(),
	// LANGFUSE_BASE_URL: z.string().optional(),

	// Database URL
	DATABASE_URL: z.string(),

	// Vercel CRON secret
	CRON_SECRET: z.string().optional(),

	// Some Default AI Model IDs, optional
	DEFAULT_SUMMARIZE_MODEL: z.string().optional(),
	DEFAULT_TRANSLATE_MODEL: z.string().optional(),
	DEFAULT_TITLE_GENERATE_MODEL: z.string().optional(),
	DEFAULT_CHECK_IMPORTANCE_MODEL: z.string().optional(),
	DEFAULT_SEARCH_QUERY_GENERATE_MODEL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;
