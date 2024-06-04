import discordBot from '@/discord/bot';
import type { ServerEnv } from '@/types/env';
import { sentry } from '@hono/sentry';
import { Hono } from 'hono';
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

app.onError((e, c) => {
	if (e instanceof HTTPException) {
		return c.json(
			{ error: e.getResponse().statusText || e.message || e.status },
			e.status,
		);
	}

	reportToSentryOnHono(c, e);

	console.error(e);

	return c.text('An error occurred', 500);
});

export default app;
