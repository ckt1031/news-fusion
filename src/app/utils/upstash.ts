import { createClient } from '@vercel/kv';
import { nextEnv } from '../env';

export const redis = createClient({
	url: nextEnv.UPSTASH_REDIS_REST_URL,
	token: nextEnv.UPSTASH_REDIS_REST_TOKEN,
});
