import * as R from 'remeda';

type Config = {
	disableAutoSummary?: boolean;
	disableAllAIFunctions?: boolean;
};
type RSSCatagoryConfig = {
	items: (RSSSourceItem | string)[];
} & Config;
export type RSSSourceItem = {
	source: string;
} & Config;
export type RSSListValue = (RSSSourceItem | string)[] | RSSCatagoryConfig;
export type RSSList = Partial<Record<RSS_CATEGORY, RSSListValue>>;

export enum RSS_CATEGORY {
	AI = 'ai',
	WEATHER = 'weather',
	POLICIAL = 'policial',
	DEVELOPER = 'developer',
	TECHNOLOGY = 'technology',
	INDIVIDUAL_BLOGS = 'individual-blogs',
	APPLICATION_UPDATES = 'application-updates',
}

export const AI_FILTER_RSS_LINKS: RSSList = {
	[RSS_CATEGORY.POLICIAL]: [
		'https://www.theguardian.com/uk/rss',
		'https://www.newyorker.com/feed/news',
	],
	[RSS_CATEGORY.TECHNOLOGY]: [
		'https://blog.google/rss',
		'https://blog.cloudflare.com/rss',
		'https://github.com/blog/all.atom',
		'https://www.theverge.com/rss/index.xml',
	],
};

/** Formal RSS */
export const MUST_READ_RSS_LIST: RSSList = {
	[RSS_CATEGORY.TECHNOLOGY]: ['http://research.microsoft.com/rss/news.xml'],
	[RSS_CATEGORY.DEVELOPER]: [
		// Tools
		'https://www.docker.com/feed',

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
	[RSS_CATEGORY.APPLICATION_UPDATES]: [
		'https://discord.com/blog/rss.xml',
		'https://obsidian.md/changelog.xml',
	],
	[RSS_CATEGORY.AI]: [
		'https://lastweekin.ai/feed',
		'https://huggingface.co/blog/feed.xml',
		'https://jina.ai/feed.rss',
	],
	[RSS_CATEGORY.WEATHER]: {
		items: ['https://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml'],
		disableAllAIFunctions: true,
		disableAutoSummary: true,
	},
	[RSS_CATEGORY.INDIVIDUAL_BLOGS]: {
		items: [
			'https://baoyu.io/feed.xml',
			'https://www.appinn.com/feed',
			'https://www.wainao.me/rss.xml',
			'https://codechina.org/feed',
			'https://weekly.tw93.fun/rss.xml',
			'https://feeds.feedburner.com/ruanyifeng',
			'https://www.williamlong.info/rss.xml',
			'https://www.owenyoung.com/atom.xml',
		],
		disableAutoSummary: true,
	},
};

export const ALL_RSS_LIST = R.mergeDeep(
	MUST_READ_RSS_LIST,
	AI_FILTER_RSS_LINKS,
);

export const EARLIEST_HOURS = 2;
