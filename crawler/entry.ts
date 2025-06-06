import type { RSSConfigFeed } from '../config/sources.js';
import { db } from '../db/index.js';
import { articles } from '../db/schema.js';
import { processNewsWithLLM } from '../lib/completions.js';
import { redisClient } from '../lib/redis.js';
import type { FeedItem } from '../lib/rss.js';
import Similarity from '../lib/similarity.js';
import { getThumbnailFromRSS } from '../lib/thumbnail.js';
import { sendPub } from './pub.js';
import { scrapeArticle } from './scrape.js';

export type FeedItemWithFeedData = {
	feedConfig: RSSConfigFeed;
	feedData: FeedItem;
};

async function isEntryExistsInRedis(guid: string) {
	const exists = await redisClient.get(`entry:${guid}`);
	return exists !== null;
}

export async function handleEntry(item: FeedItemWithFeedData) {
	// console.debug(`Checking ${item.feedData.title}`);

	const guid = item.feedData.guid;
	const title = item.feedData.title;

	// We will not process the entry if it's older than 12 hours
	if (
		new Date(item.feedData.pubDate) < new Date(Date.now() - 12 * 60 * 60 * 1000)
	) {
		console.debug(`Article (${title}) is older than 12 hours, skipping...`);
		return;
	}

	if (await isEntryExistsInRedis(guid)) return;

	// Sleep random time between 1 and 3 seconds.
	await new Promise((resolve) =>
		setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000),
	);

	// If the feed is configured to use the XML content, we don't need to scrape the article.
	const isScrapingNeeded = !item.feedConfig.useXmlContent;

	let articleContent = item.feedData.content;
	let thumbnail = await getThumbnailFromRSS(item.feedData.rawContent);

	if (isScrapingNeeded) {
		// Scrape the article.
		const articleData = await scrapeArticle(item.feedData.link);

		thumbnail = articleData.image ?? thumbnail;
		articleContent = articleData.content ?? articleContent;
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

	console.debug(processedData);

	// Save to redis for duplicate check, value as 1 to reduce memory usage.
	await redisClient.set(`entry:${guid}`, 1, {
		EX: 60 * 60 * 24 * 3, // 3 days (1 day is 86400 seconds)
	});

	if (!processedData.important) {
		console.debug(`Article (${title}) is not important, skipping...`);
		return;
	}

	await sendPub(processedData.category);

	// Save the article to the database.
	await similarity.saveArticle(item.feedData, similarityResult.embedding);

	// Save the article to the database.
	await db.insert(articles).values({
		guid,
		thumbnail,
		link: item.feedData.link,
		title: processedData.title,
		summary: processedData.summary,
		category: processedData.category,
		publisher: item.feedConfig.name,
		publishedAt: new Date(item.feedData.pubDate),
	});

	console.debug(`Article (${title}) processed successfully`);
}
