import { lt } from 'drizzle-orm';
import { db } from '~~/db/index';
import { articles } from '~~/db/schema';
import Similarity from '~~/lib/similarity';

export default defineEventHandler(async (event) => {
	const authHeader = event.node.req.headers.authorization;

	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const similarity = new Similarity();

	// Initialize the collection if it doesn't exist
	await similarity.initializeCollection();

	// Create index if it doesn't exist
	await similarity.qdrantClient.createPayloadIndex(similarity.collectionName, {
		field_name: 'createdAt',
		field_schema: 'datetime',
	});

	// Remove all articles older than 30 days
	await similarity.qdrantClient.delete(similarity.collectionName, {
		filter: {
			must: [
				{
					key: 'createdAt',
					range: {
						// 30 days ago, in ISO format
						lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
					},
				},
			],
		},
	});

	// Remove all articles older than 30 days from the database
	await db
		.delete(articles)
		.where(
			lt(articles.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
		);

	return Response.json({ success: true });
});
