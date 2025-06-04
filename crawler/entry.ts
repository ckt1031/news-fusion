import type { FeedItem } from '../lib/rss';
import { articles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../db';

async function isEntryChecked(guid: string) {
	// Check from database
	const checked = await db
		.select({
			// Select only guid to avoid fetching the entire article.
			guid: articles.guid,
		})
		.from(articles)
		.where(eq(articles.guid, guid));

	return checked.length > 0;
}

export async function handleEntry(item: FeedItem) {
	console.debug(`Checking ${item.title}`);

	const guid = item.guid;

	if (await isEntryChecked(guid)) return;

	// Sleep random time between 1 and 3 seconds.
	await new Promise((resolve) =>
		setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000),
	);
}
