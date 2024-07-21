import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const nextClientEnv = createEnv({
	client: {
		NEXT_PUBLIC_SUPABASE_URL: z.string(),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),

		// CAPTCHA Turnstile
		NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
	},
});
