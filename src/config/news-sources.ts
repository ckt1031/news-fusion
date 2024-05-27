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
		// TODO: Add /exclude_rts_replies later
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
	[RSS_CATEGORY.GENERAL]: [
		'https://www.newyorker.com/feed/news',
		// 'https://www.theguardian.com/uk/rss',
		// 'https://feeds2.feedburner.com/businessinsider',
	],
	[RSS_CATEGORY.TECH]: [
		'https://blog.google/rss',
		'https://blog.cloudflare.com/rss',
		'https://github.com/blog/all.atom',
		'https://www.theverge.com/rss/index.xml',
		// 'https://feeds.bloomberg.com/technology/news.rss',
	],
};

/** Formal RSS */
export const MUST_READ_RSS_LIST: Partial<Record<RSS_CATEGORY, string[]>> = {
	[RSS_CATEGORY.TECH]: ['http://research.microsoft.com/rss/news.xml'],
	[RSS_CATEGORY.DEV]: [
		// Tools
		'https://blog.jetbrains.com/feed',
		'https://www.docker.com/feed/',

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

		// AI but basically programming
		'https://blog.langchain.dev/rss',

		// Developer Platform
		'https://vercel.com/atom',
		'https://stackoverflow.blog/feed',
		'https://blog.replit.com/feed.xml',
		'https://supabase.com/feed.xml',
	],
	[RSS_CATEGORY.APP]: [
		'https://discord.com/blog/rss.xml',
		'https://obsidian.md/changelog.xml',
	],
	[RSS_CATEGORY.AI]: [
		'https://lastweekin.ai/feed',
		'https://huggingface.co/blog/feed.xml',
		'https://jina.ai/feed.rss',
	],
	[RSS_CATEGORY.WEATHER]: [
		'https://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml',
	],
	[RSS_CATEGORY.BLOG]: [
		'https://baoyu.io/feed.xml',
		'https://www.appinn.com/feed',
		'https://www.wainao.me/rss.xml',
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

export const EARLIEST_HOURS = 2;
