import { Hono } from 'hono';
import discordBot from '../discord/bot';
import { cronCheckNews } from '../lib/handle-news';

const app = new Hono();

app.get('/', (c) => {
	return c.text('Hey Here!');
});

app.get('/cron', async (c) => {
	await cronCheckNews(c.env);
	return c.text('Done!');
});

app.route('/discord', discordBot);

export default app;
