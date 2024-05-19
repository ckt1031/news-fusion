import { NewArticleSchema } from '@/db/schema';
import { checkIfNewsIsNew, createArticleDatabase } from '@/lib/db';
import removeTrailingSlash from '@/lib/remove-trailing-slash';
import type { ServerEnv } from '@/types/env';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { defaultBearerAuth } from './middleware';

/**
 * Since Cloudflare D1 cannot be used directly outside of Cloudflare, we need to make an abstraction layer to use it.
 * This is the abstraction layer for the D1 database.
 */

const app = new Hono<{ Bindings: ServerEnv }>();

app.use(defaultBearerAuth);

const checkRoute = app.post(
	'/check-article-is-new',
	zValidator(
		'json',
		z.object({
			url: z.string().transform(removeTrailingSlash),
		}),
	),
	async (c) => {
		const { url } = c.req.valid('json');
		return c.json({ isNew: await checkIfNewsIsNew(c.env, url) });
	},
);

const createRoute = app.put(
	'/create-article',
	zValidator('json', NewArticleSchema),
	async (c) => {
		const data = c.req.valid('json');
		await createArticleDatabase(c.env, data);
		return c.json({ success: true });
	},
);

export type CheckArticleRequest = typeof checkRoute;
export type CreateArticleRequest = typeof createRoute;

export default app;
