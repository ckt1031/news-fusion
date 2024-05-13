import { cronCheckNews } from './lib/handle-news';
import { initSentry } from './lib/sentry';
import app from './server';
import type { ServerEnv } from './types/env';

export default {
	async scheduled(
		_event: ScheduledEvent,
		env: ServerEnv,
		ctx: ExecutionContext,
	): Promise<void> {
		ctx.waitUntil(
			cronCheckNews(env).catch((e) => {
				if (env.SENTRY_DSN && env.SENTRY_DSN.length > 0) {
					const sentry = initSentry(env.SENTRY_DSN, ctx);
					sentry.captureException(e);
				}

				console.error(e);
				throw e;
			}),
		);
	},
	async fetch(request: Request, env: ServerEnv) {
		return await app.fetch(request, env);
	},
};
