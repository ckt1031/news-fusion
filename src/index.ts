import { clearUnusedDatabaseData } from '@/lib/db';
import { initSentry } from '@/lib/sentry';
import app from '@/server';
import type { ServerEnv } from '@/types/env';
import consola from 'consola';

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

			consola.error(e);
			throw e;
		};

		// Every 2 days
		if (event.cron === '0 0 */2 * *') {
			ctx.waitUntil(clearUnusedDatabaseData().catch(handleCrash));
		}
	},
	fetch: app.fetch,
};
