import type { FeedItem } from '../lib/rss';
import { articles } from '../db/schema';
import { db } from '../db';
import type { RSSConfigFeed } from '../config/sources';
import { scrapeArticle } from './scrape';
import Similarity from '../lib/similarity';
import { redisClient } from '../lib/redis';
import { processNewsWithLLM } from '../lib/completions';

export type FeedItemWithFeedData = {
	feedConfig: RSSConfigFeed;
	feedData: FeedItem;
};

async function isEntryExistsInRedis(guid: string) {
	const exists = await redisClient.get(`entry:${guid}`);
	return exists !== null;
}

export async function handleEntry(item: FeedItemWithFeedData) {
	console.debug(`Checking ${item.feedData.title}`);

	const guid = item.feedData.guid;
	const title = item.feedData.title;

	if (await isEntryExistsInRedis(guid)) return;

	// Sleep random time between 1 and 3 seconds.
	await new Promise((resolve) =>
		setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000),
	);

	// If the feed is configured to use the XML content, we don't need to scrape the article.
	const isScrapingNeeded = !item.feedConfig.useXmlContent;

	let articleContent = item.feedData.content;

	if (isScrapingNeeded) {
		// Scrape the article.
		articleContent = await scrapeArticle(item.feedData.link);
	}

	const similarity = new Similarity();

	const similarityResult = await similarity.getSimilarArticles(articleContent);

	if (similarityResult.similar) {
		// If the article is similar to another article, we don't need to save it.
		console.debug(
			`Article (${title}) is similar to another article, skipping...`,
		);
		return;
	}

	const processedData = await processNewsWithLLM(item, articleContent);

	// Save to redis for duplicate check, value as 1 to reduce memory usage.
	await redisClient.set(`entry:${guid}`, 1, {
		EX: 60 * 60 * 24 * 3, // 3 days (1 day is 86400 seconds)
	});

	if (!processedData.important) {
		console.debug(`Article (${title}) is not important, skipping...`);
		return;
	}

	// Save the article to the database.
	await similarity.saveArticle(item.feedData, similarityResult.embedding);

	// Save the article to the database.
	await db.insert(articles).values({
		guid,
		link: item.feedData.link,
		title: processedData.title,
		summary: processedData.summary,
		category: processedData.category,
		publisher: item.feedConfig.name,
		publishedAt: new Date(item.feedData.pubDate),
	});
}
