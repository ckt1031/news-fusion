import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const nextClientEnv = createEnv({
	client: {
		NEXT_PUBLIC_SUPABASE_URL: z.string(),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),

		/**
		 * Enable Vercel Speed Insight and Analytics
		 * Use string `true` to enable
		 */
		NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS: z.string().optional(),

		// CAPTCHA Turnstile
		NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS:
			process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS,
		NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
	},
});
