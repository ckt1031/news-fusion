import * as R from 'remeda';

export enum RSS_CATEGORY {
	AI = 'ai',
	TECH = 'tech',
	DEV = 'programming-dev',

	WEATHER = 'weather',

	// General News
	GENERAL = 'general',
	NATIONAL = 'national',

	// Regional
	LOCAL_HKG = 'hkg',

	// General Blog with multiple categories
	BLOG = 'blog',
	APP = 'app',
}

export const AI_FILTER_RSSHUB_PATHS: Partial<Record<RSS_CATEGORY, string[]>> = {
	[RSS_CATEGORY.AI]: [
		// Add /exclude_rts_replies later
		'/twitter/user/aiatmeta',
		'/twitter/user/cohere',
		'/twitter/user/anthropicai',
		'/twitter/user/openai',
		'/twitter/user/openaidevs',
		'/twitter/user/perplexity_ai',
		'/twitter/user/deepseek_ai',
		'/twitter/user/groqinc',
	],
};

export const AI_FILTER_RSS_LINKS: Partial<Record<RSS_CATEGORY, string[]>> = {
	[RSS_CATEGORY.LOCAL_HKG]: ['https://www.scmp.com/rss/2/feed'],
	[RSS_CATEGORY.TECH]: [
		'https://blog.google/rss',
		'https://github.com/blog/all.atom',
		'https://feeds.bloomberg.com/technology/news.rss',
	],
	[RSS_CATEGORY.GENERAL]: [
		'https://www.newyorker.com/feed/news',
		'https://www.theguardian.com/uk/rss',
		'https://feeds2.feedburner.com/businessinsider',
	],
};

/** Formal RSS */
export const MUST_READ_RSS_LIST: Partial<Record<RSS_CATEGORY, string[]>> = {
	[RSS_CATEGORY.TECH]: ['https://www.theverge.com/rss/index.xml'],
	[RSS_CATEGORY.DEV]: [
		// Open Source
		'https://hellogithub.com/rss',

		// Microsoft
		'https://blogs.windows.com/feed',

		// Programming Languages
		'https://bun.sh/rss.xml',
		'https://deno.com/feed',
		'https://nodejs.org/en/feed/blog.xml',

		// Frameworks
		'https://nextjs.org/feed.xml',
		'https://astro.build/rss.xml',

		// Developer Platform
		'https://vercel.com/atom',
		'https://blog.replit.com/feed.xml',
	],
	[RSS_CATEGORY.APP]: [
		'https://discord.com/blog/rss.xml',
		'https://obsidian.md/changelog.xml',
	],
	[RSS_CATEGORY.AI]: ['https://huggingface.co/blog/feed.xml'],
	[RSS_CATEGORY.WEATHER]: [
		'https://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml',
	],
	[RSS_CATEGORY.BLOG]: [
		// App Sharing
		'https://www.appinn.com/feed',

		'https://www.wainao.me/rss.xml',

		// Tinyfool
		'https://codechina.org/feed',
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

export const EARLIEST_DAYS = 2;
