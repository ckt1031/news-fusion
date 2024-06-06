import { initSentry } from '@/lib/sentry';
import type { ServerEnv } from '@/types/env';
import type { Context } from 'hono';
import { getRuntimeKey } from 'hono/adapter';

export const reportToSentryOnHono = (
	c: Context<
		{
			Bindings: ServerEnv;
		},
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		any,
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		{}
	>,
	error: Error,
) => {
	if (c.env.SENTRY_DSN && c.env.SENTRY_DSN.length > 0) {
		if (getRuntimeKey() === 'workerd') {
			const sentry = initSentry(c.env.SENTRY_DSN, c.executionCtx);
			sentry.captureException(error);
		}
	}
};
