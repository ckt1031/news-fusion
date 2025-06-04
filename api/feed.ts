import { desc } from 'drizzle-orm';
import { Hono } from 'hono';
import RSS from 'rss';
import { RSS_CATEGORIES } from '../config/sources';
import { db } from '../db';
import { articles } from '../db/schema';

export const router = new Hono();

function isCategoryValid(category: string) {
	return RSS_CATEGORIES.some((c) => c.id === category);
}

router.get('/:category', async (c) => {
	const category = c.req.param('category');

	if (!isCategoryValid(category)) {
		return c.json({ error: 'Invalid category' }, 400);
	}

	const categoryData = RSS_CATEGORIES.find((c) => c.id === category);

	// Below will never happen, but just in case
	// And makes TypeScript happy
	if (!categoryData) throw new Error('Category not found');

	const queriedArticles = await db
		.select()
		.from(articles)
		.limit(150)
		.orderBy(desc(articles.publishedAt));

	const SITE_DOMAIN = process.env.SITE_DOMAIN || 'localhost:3000';

	const feed = new RSS({
		title: `News Fusion - ${categoryData.name}`,
		feed_url: `https://${SITE_DOMAIN}/v1/feeds/${category}`,
		site_url: `https://${SITE_DOMAIN}`,
	});

	for (const article of queriedArticles) {
		feed.item({
			title: article.title,
			description: article.summary,
			url: article.link,
			date: article.publishedAt,
			guid: article.guid,
		});
	}

	return c.body(feed.xml(), 200, {
		'Content-Type': 'application/xml; charset=UTF-8',
	});
});
