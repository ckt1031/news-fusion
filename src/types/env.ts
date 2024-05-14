import { z } from 'zod';

export const envSchema = z.object({
	OPENAI_API_BASE_URL: z.string().optional(),
	OPENAI_API_KEY: z.string(),
	OPENAI_LLM_MODEL: z.string().optional(),

	DISCORD_BOT_TOKEN: z.string(),
	DISCORD_APPLICATION_ID: z.string(),
	DISCORD_PUBLIC_KEY: z.string(),
	DISCORD_RSS_CHANNEL_ID: z.string(),

	TOOLS_API_BASE_URL: z.string(),
	TOOLS_API_KEY: z.string(),

	SENTRY_DSN: z.string().optional(),

	RSSHUB_API_BASE_URL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof envSchema> & {
	D1: D1Database;
};
