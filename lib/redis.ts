import { createClient } from 'redis';

const client = createClient({
	url: process.env.REDIS_URL,
});

/**
 * Ignore the TypeScript error as the Redis client is not going to be used in the serverless environment.
 */
// @ts-ignore
export const redisClient = await client.connect();
