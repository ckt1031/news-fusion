import { lt } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/index.js';
import { articles } from '../db/schema.js';
import Similarity from '../lib/similarity.js';

export const router = new Hono();

router.get('/', async (c) => {
	const authHeader = c.req.header('Authorization');

	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const similarity = new Similarity();

	// Initialize the collection if it doesn't exist
	await similarity.initializeCollection();

	// Remove all articles older than 30 days
	await similarity.qdrantClient.delete(similarity.collectionName, {
		filter: {
			must: {
				key: 'date',
				range: {
					// 30 days ago, in ISO format
					lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				},
			},
		},
	});

	// Remove all articles older than 30 days from the database
	await db
		.delete(articles)
		.where(
			lt(articles.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
		);

	return c.json({ success: true });
});
