import { z } from "zod";

export const envSchema = z.object({
  OPENAI_API_BASE_URL: z.string().optional().default("https://api.openai.com/v1"),
  OPENAI_API_KEY: z.string(),
  OPENAI_LLM_MODEL: z.string().default("gpt-3.5-turbo"),

  DISCORD_BOT_TOKEN: z.string(),
  DISCORD_APPLICATION_ID: z.string(),
  DISCORD_PUBLIC_KEY: z.string(),
  DISCORD_RSS_CHANNEL_ID: z.string(),

  TOOLS_API_BASE_URL: z.string(),
  TOOLS_API_KEY: z.string(),
});

export type ServerEnv = z.infer<typeof envSchema> & {
  D1: D1Database;
};

export const env = envSchema.parse(process.env);
