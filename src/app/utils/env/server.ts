import { envSchema } from '@/types/env';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const nextServerEnv = createEnv({
	server: {
		SITE_URL: z.string().default('http://localhost:3000'),
		/**
		 * Vercel API Cron Secret
		 */
		CRON_SECRET: z.string().optional(),
		ENABLE_RATE_LIMIT: z.string().optional(),

		// @ts-ignore
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
		// @ts-ignore
		NEXT_PUBLIC_SUPABASE_URL: z.string(),
		...envSchema.shape,
	},
	// @ts-ignore
	runtimeEnv: process.env,
});
