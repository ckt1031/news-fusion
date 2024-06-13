import { Redis } from '@upstash/redis';
import { nextEnv } from '../env';

export const redis = new Redis({
	url: nextEnv.UPSTASH_REDIS_REST_URL,
	token: nextEnv.UPSTASH_REDIS_REST_TOKEN,
});
