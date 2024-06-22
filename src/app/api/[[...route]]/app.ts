import { clearUnusedDatabaseData } from '@/lib/db';
import type { ServerEnv } from '@/types/env';
import { sentry } from '@hono/sentry';
import consola from 'consola';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { reportToSentryOnHono } from './on-error';

const app = new Hono<{ Bindings: ServerEnv }>().basePath('/api');

app.use('*', sentry());

// Runs every month
app.get('/cron/clear-unused-database-data', async (c) => {
	if (c.req.header('Authorization') !== `Bearer ${c.env.CRON_SECRET}`) {
		return c.text('Unauthorized', 401);
	}

	await clearUnusedDatabaseData();

	return c.json({ success: true }, 200);
});

app.onError((e, c) => {
	if (e instanceof HTTPException) {
		return c.json(
			{ error: e.getResponse().statusText || e.message || e.status },
			e.status,
		);
	}

	reportToSentryOnHono(c, e);

	consola.error(e);

	return c.text('An error occurred', 500);
});

export default app;
