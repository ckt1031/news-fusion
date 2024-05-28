type Config = {
	checkImportance?: boolean;
	disableAutoSummary?: boolean;
	disableAllAIFunctions?: boolean;
};

export type RssSourceItem =
	| ({
			url: string;
	  } & Config)
	| string;
export type RssCatagory = {
	name: RSS_CATEGORY;
	sources: RssSourceItem[];

	// Push to this channel
	discordChannelId: string;
} & Config;

export enum RSS_CATEGORY {
	BLOGS = 'blogs',
	VIDEOS = 'videos',
	ALERTS = 'alerts',
	GENERAL = 'general',
	DEVELOPER = 'developer',
	TECHNOLOGY = 'technology',
}

export const RSS_GENERAL: RssCatagory = {
	name: RSS_CATEGORY.GENERAL,
	discordChannelId: '1232637503144722432',
	sources: [
		'https://www.theguardian.com/uk/rss',
		'https://www.newyorker.com/feed/news',
	],
};

export const RSS_VIDEOS: RssCatagory = {
	name: RSS_CATEGORY.VIDEOS,
	discordChannelId: '1245004330868674591',
	sources: [
		'{RSSHUB}/bilibili/user/video/25876945', // 极客湾 Geekerwan
		'{RSSHUB}/youtube/user/@kurzgesagt', // YouTube: Kurzgesagt – In a Nutshell
		'{RSSHUB}/youtube/user/@xiao_lin_shuo', // YouTube: 小Lin说
	],
};

export const RSS_TECH: RssCatagory = {
	name: RSS_CATEGORY.TECHNOLOGY,
	discordChannelId: '1245004214678061096',
	sources: [
		'https://blog.google/rss',
		'https://blog.cloudflare.com/rss',
		'https://github.com/blog/all.atom',
		'https://www.theverge.com/rss/index.xml',
		{
			url: 'http://research.microsoft.com/rss/news.xml',
			checkImportance: false,
		},
		// AI
		'https://lastweekin.ai/feed',
		'https://huggingface.co/blog/feed.xml',
		'https://jina.ai/feed.rss',
	],
};

export const RSS_DEV: RssCatagory = {
	name: RSS_CATEGORY.DEVELOPER,
	discordChannelId: '1245006701812387890',
	checkImportance: false,
	sources: [
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
};

export const RSS_ALERTS: RssCatagory = {
	name: RSS_CATEGORY.ALERTS,
	discordChannelId: '1245007194064293929',
	checkImportance: false,
	disableAutoSummary: true,
	disableAllAIFunctions: true,
	sources: ['https://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml'],
};

export const RSS_BLOGS: RssCatagory = {
	name: RSS_CATEGORY.BLOGS,
	discordChannelId: '1245007333624348672',
	checkImportance: false,
	sources: [
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

export const ALL_RSS_CATAGORIES = [
	RSS_GENERAL,
	RSS_VIDEOS,
	RSS_TECH,
	RSS_DEV,
	RSS_ALERTS,
	RSS_BLOGS,
];

export const EARLIEST_HOURS = 2;
