export enum RSS_CATEGORY {
	TECH = 'tech',
	DEV = 'programming-dev',
	AI = 'ai',
	WEATHER = 'weather',
	NATIONAL = 'national',
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
		'https://weekly.tw93.fun/rss.xml',
		'https://feeds.feedburner.com/ruanyifeng',
	],
	[RSS_CATEGORY.DEV]: [
		'https://bun.sh/rss.xml',
		'https://deno.com/feed',
		'https://nodejs.org/en/feed/blog.xml',
		'https://hellogithub.com/rss',
		'https://blogs.windows.com/feed/',
	],
	[RSS_CATEGORY.AI]: ['https://huggingface.co/blog/feed.xml'],
	[RSS_CATEGORY.WEATHER]: [
		'https://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml',
	],
};

export const NEWS_MINIMALIST_API =
	'https://www.newsminimalist.com/api/get-all-stories';

export const EARLIEST_DAYS = 3;
