import discordBot from '@/discord/bot';
import { clearUnusedDatabaseData } from '@/lib/db';
import type { ServerEnv } from '@/types/env';
import { sentry } from '@hono/sentry';
import consola from 'consola';
import { Hono } from 'hono';
import { getRuntimeKey } from 'hono/adapter';
import { HTTPException } from 'hono/http-exception';
import { reportToSentryOnHono } from './on-error';

const app = new Hono<{ Bindings: ServerEnv }>();

app.use('*', sentry());

app.get('/', (c) => {
	return c.text('Hey Here!');
});

app.route('/discord', discordBot);

// robots.txt, disallow all
app.get('/robots.txt', (c) => {
	return c.text('User-agent: *\nDisallow: /');
});

// robots.txt, disallow all
app.get('/versions', (c) => {
	return c.json({
		runtime: getRuntimeKey(),
		...(typeof process !== 'undefined' && {
			server: process.versions,
		}),
	});
});

// Vercel Cron Job
app.get('/cron/vercel', async (c) => {
	if (c.req.header('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
		return c.text('Unauthorized', 401);
	}

	await clearUnusedDatabaseData();

	return c.text('Cron job done');
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
