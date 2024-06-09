import { z } from 'zod';

export const envSchema = z.object({
	OPENAI_API_BASE_URL: z.string().optional(),
	OPENAI_API_KEY: z.string(),

	DISCORD_GUILD_ID: z.string(),
	DISCORD_BOT_TOKEN: z.string(),
	DISCORD_APPLICATION_ID: z.string(),
	DISCORD_PUBLIC_KEY: z.string(),

	RSSHUB_BASE_URL: z.string().optional(),
	RSSHUB_ACCESS_KEY: z.string().optional(),

	TOOLS_API_BASE_URL: z.string(),
	TOOLS_API_KEY: z.string(),

	SENTRY_DSN: z.string().optional(),

	LANGFUSE_SECRET_KEY: z.string().optional(),
	LANGFUSE_PUBLIC_KEY: z.string().optional(),
	LANGFUSE_BASE_URL: z.string().optional(),

	// Database URL
	DATABASE_URL: z.string(),

	// Vercel CRON secret
	CRON_SECRET: z.string().optional(),

	// Some Default AI Model IDs
	DEFAULT_SUMMARIZE_MODEL: z.string().optional(),
	DEFAULT_TRANSLATE_MODEL: z.string().optional(),
	DEFAULT_TITLE_GENERATE_MODEL: z.string().optional(),
	DEFAULT_CHECK_IMPORTANCE_MODEL: z.string().optional(),
	DEFAULT_SEARCH_QUERY_GENERATE_MODEL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;
