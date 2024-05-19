import type { ServerEnv } from '@/types/env';
import { env } from 'hono/adapter';
import { bearerAuth } from 'hono/bearer-auth';
import safeCompare from '../lib/safe-compare';

export const defaultBearerAuth = bearerAuth({
	verifyToken: async (requestToken, c) => {
		const { WORKER_API_KEY } = env<ServerEnv>(c);

		if (!WORKER_API_KEY || WORKER_API_KEY.length === 0) {
			return true;
		}

		return await safeCompare(requestToken, WORKER_API_KEY);
	},
});
