import { sentry } from '@hono/sentry';
import { Hono } from 'hono';
import discordBot from '../discord/bot';
import { initSentry } from '../lib/sentry';
import type { ServerEnv } from '../types/env';

const app = new Hono<{ Bindings: ServerEnv }>();

app.use('*', sentry());

app.get('/', (c) => {
	return c.text('Hey Here!');
});

app.route('/discord', discordBot);

app.onError((e, c) => {
	if (c.env.SENTRY_DSN && c.env.SENTRY_DSN.length > 0) {
		const sentry = initSentry(c.env.SENTRY_DSN, c.executionCtx);
		sentry.captureException(e);
	}

	console.error(e);

	return c.text('Internal Server Error', 500);
});

export default app;
