import { createClient } from '@vercel/kv';
import { nextEnv } from '../env';

export const redis = createClient({
	url: nextEnv.UPSTASH_REDIS_REST_URL,
	token: nextEnv.UPSTASH_REDIS_REST_TOKEN,
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let cache: Map<string, any> | null = null;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function getMapCache(): Map<string, any> {
	if (!cache) {
		cache = new Map();
	}
	return cache;
}
