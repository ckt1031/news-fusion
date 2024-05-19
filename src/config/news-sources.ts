import * as R from 'remeda';

export enum RSS_CATEGORY {
	TECH = 'tech',
	DEV = 'programming-dev',
	AI = 'ai',
	WEATHER = 'weather',
	NATIONAL = 'national',

	// General Blog with multiple categories
	BLOG = 'blog',
	APP = 'app',
}

export const AI_FILTER_RSS_LINKS: Partial<Record<RSS_CATEGORY, string[]>> = {
	[RSS_CATEGORY.TECH]: [
		'https://github.com/blog/all.atom',
		'https://blog.google/rss',
		'https://feeds2.feedburner.com/businessinsider',
		'https://www.theverge.com/tech/rss/index.xml',
	],
};

/** Formal RSS */
export const MUST_READ_RSS_LIST: Partial<Record<RSS_CATEGORY, string[]>> = {
	[RSS_CATEGORY.TECH]: [
		'https://vercel.com/atom',
		'https://feeds.appinn.com/appinns',
	],
	[RSS_CATEGORY.DEV]: [
		'https://bun.sh/rss.xml',
		'https://deno.com/feed',
		'https://nodejs.org/en/feed/blog.xml',
		'https://hellogithub.com/rss',
		'https://blogs.windows.com/feed/',

		// Developer Platform
		'https://blog.replit.com/feed.xml',
	],
	[RSS_CATEGORY.APP]: ['https://discord.com/blog/rss.xml'],
	[RSS_CATEGORY.AI]: ['https://huggingface.co/blog/feed.xml'],
	[RSS_CATEGORY.WEATHER]: [
		'https://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml',
	],
	[RSS_CATEGORY.BLOG]: [
		// 'https://www.solidot.org/index.rss',

		// Tinyfool
		'https://codechina.org/feed/',
		'https://weekly.tw93.fun/rss.xml',
		'https://feeds.feedburner.com/ruanyifeng',
		'https://www.williamlong.info/rss.xml',
		'https://www.owenyoung.com/atom.xml',
	],
};

export const ALL_RSS_LIST = R.mergeDeep(
	MUST_READ_RSS_LIST,
	AI_FILTER_RSS_LINKS,
);

export const NEWS_MINIMALIST_API =
	'https://www.newsminimalist.com/api/get-all-stories';

export const EARLIEST_DAYS = 3;
