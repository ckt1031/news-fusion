import { desc } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { Feed } from 'feed';
import { RSS_CATEGORIES } from '~~/config/sources';
import { db } from '~~/db';
import { articles } from '~~/db/schema';

export function isCategoryValid(category: string) {
	return RSS_CATEGORIES.some((c) => c.id === category);
}

export default defineEventHandler(async (event) => {
	const categoryWithFormat = event.context.params?.category || '';
	const [category, format] = categoryWithFormat.split('.');
	const allowedFormats = ['xml', 'atom', 'json'];

	// If format is provided, check if it's valid
	if (format && !allowedFormats.includes(format)) {
		return Response.json({ error: 'Invalid format' }, { status: 400 });
	}

	// If category is not valid, return 400
	if (!isCategoryValid(category)) {
		return Response.json({ error: 'Invalid category' }, { status: 400 });
	}

	// Get the category data
	const categoryData = RSS_CATEGORIES.find((c) => c.id === category);

	// Below will never happen, but just in case
	// And makes TypeScript happy
	if (!categoryData) throw new Error('Category not found');

	const queriedArticles = await db
		.select()
		.from(articles)
		.where(eq(articles.category, category))
		.limit(150)
		.orderBy(desc(articles.publishedAt));

	const SITE_DOMAIN = process.env.SITE_DOMAIN || 'localhost:3000';

	const feed = new Feed({
		id: `https://${SITE_DOMAIN}`,
		link: `https://${SITE_DOMAIN}`,
		title: `News Fusion - ${categoryData.name}`,
		copyright: `All rights reserved ${new Date().getFullYear()}, News Fusion`,
		description:
			'News Fusion is a news aggregator that collects news from various sources and provides a unified feed.',
		hub: 'https://pubsubhubbub.appspot.com/',
	});

	for (const article of queriedArticles) {
		feed.addItem({
			id: article.guid,
			title: article.title,
			description: article.summary,
			link: article.link,
			date: article.publishedAt,
		});
	}

	const isRSS = format === 'xml';
	const isAtom = !format || format === 'atom';

	const contentType = isRSS || isAtom ? 'application/xml' : 'application/json';
	const feedContent = isRSS
		? feed.rss2()
		: isAtom
			? feed.atom1()
			: feed.json1();

	return new Response(feedContent, {
		headers: {
			'Content-Type': `${contentType}; charset=UTF-8`,
		},
	});
});
