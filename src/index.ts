import { clearUnusedDatabaseData } from '@/lib/db';
import { checkNews } from '@/lib/news';
import { initSentry } from '@/lib/sentry';
import app from '@/server';
import type { ServerEnv } from '@/types/env';

export default {
	async scheduled(
		event: ScheduledEvent,
		env: ServerEnv,
		ctx: ExecutionContext,
	) {
		const handleCrash = (e: Error) => {
			if (env.SENTRY_DSN && env.SENTRY_DSN.length > 0) {
				const sentry = initSentry(env.SENTRY_DSN, ctx);
				sentry.captureException(e);
			}

			console.error(e);
			throw e;
		};

		// Every 20 minutes
		if (event.cron === '*/20 * * * *') {
			ctx.waitUntil(
				checkNews(env, {
					doNotCheckAiFilter: true,
				}).catch(handleCrash),
			);
		}

		// Every 2 days
		if (event.cron === '0 0 */2 * *') {
			ctx.waitUntil(clearUnusedDatabaseData(env).catch(handleCrash));
		}
	},
	async fetch(request: Request, env: ServerEnv) {
		return await app.fetch(request, env);
	},
};
