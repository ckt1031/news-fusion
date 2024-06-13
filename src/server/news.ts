import { getNewsBasedOnDateAndCategory } from '@/lib/db';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

const newsRoute = app.get(
	'/',
	zValidator(
		'query',
		z.object({
			date: z.string(),
			category: z.string(),
		}),
	),
	async (c) => {
		const { date, category } = c.req.valid('query');
		const articles = await getNewsBasedOnDateAndCategory(date, category);

		return c.json(articles);
	},
);

export type NewsRoute = typeof newsRoute;

export default app;
