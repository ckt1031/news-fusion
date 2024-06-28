import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const nextEnv = createEnv({
	/*
	 * Serverside Environment variables, not available on the client.
	 * Will throw if you access these variables on the client.
	 */
	server: {
		ENABLE_VERCEL_ANALYTICS: z.string().optional(), // 1 or 0, 1 is enabled
		UPSTASH_REDIS_REST_URL: z.string(),
		UPSTASH_REDIS_REST_TOKEN: z.string(),
		SITE_URL: z.string().default('http://localhost:3000'),
		CRON_SECRET: z.string().optional(),
	},

	/*
	 * Environment variables available on the client (and server).
	 *
	 * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
	 */
	client: {
		NEXT_PUBLIC_SUPABASE_URL: z.string(),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),

		// CAPTCHA Turnstile
		NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
	},
	/*
	 * Due to how Next.js bundles environment variables on Edge and Client,
	 * we need to manually destructure them to make sure all are included in bundle.
	 *
	 * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
	 */
	runtimeEnv: {
		SITE_URL: process.env.SITE_URL,

		CRON_SECRET: process.env.CRON_SECRET,

		ENABLE_VERCEL_ANALYTICS: process.env.ENABLE_VERCEL_ANALYTICS,

		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,

		UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
		UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
	},
});
