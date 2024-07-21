import 'dotenv/config';

import { createClient } from '@vercel/kv';

export const redis = createClient({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
