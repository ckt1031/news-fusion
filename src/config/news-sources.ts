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
export interface RssCatagory extends Config {
	name: RSS_CATEGORY;
	sources: RssSourceItem[];

	// Push to this channel
	discordChannelId: string;
}

export enum RSS_CATEGORY {
	BLOGS = 'blogs',
	HKG = 'hkg',
	THINKING = 'thinking',
	VIDEOS = 'videos',
	ALERTS = 'alerts',
	GENERAL = 'general',
	DEVELOPER = 'developer',
	UPDATES = 'updates',
	TECHNOLOGY = 'technology',
}

export const RSS_GENERAL: RssCatagory = {
	name: RSS_CATEGORY.GENERAL,
	discordChannelId: '1245738873787645962',
	sources: [
		'https://rss.politico.com/politics08.xml',
		'https://feeds.bbci.co.uk/news/world/rss.xml',
	],
};

export const RSS_HKG: RssCatagory = {
	name: RSS_CATEGORY.HKG,
	discordChannelId: '1245731477048660021',
	sources: ['https://www.scmp.com/rss/2/feed'],
};

export const RSS_THINKING: RssCatagory = {
	name: RSS_CATEGORY.THINKING,
	discordChannelId: '1245734549879525546',
	sources: [
		'https://asteriskmag.com/feed',
		'https://www.nplusonemag.com/feed',
		'https://www.newyorker.com/feed/news',
		'https://api.quantamagazine.org/feed',
		'https://www.noemamag.com/?feed=noemarss',
	],
};

export const RSS_VIDEOS: RssCatagory = {
	name: RSS_CATEGORY.VIDEOS,
	discordChannelId: '1245004330868674591',
	disableAllAIFunctions: false,
	disableAutoSummary: false,
	checkImportance: false,
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
		'https://www.theverge.com/rss/index.xml',
		'https://www.theregister.com/headlines.rss',
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
		'https://blog.cloudflare.com/rss',
		'https://github.blog/feed',
		// AI
		'https://rsshub.bestblogs.dev/deeplearning/thebatch',

		'https://www.netlify.com/community-feed.xml',
		'https://www.koyeb.com/feed.xml',
		'https://blog.postman.com/feed',

		'https://www.docker.com/feed',
		// Open Source
		'{RSSHUB}/hellogithub/article',
		// Microsoft
		'https://blogs.windows.com/feed',
		// Programming Languages
		'https://bun.sh/rss.xml',
		'https://deno.com/feed',
		'https://blog.rust-lang.org/feed',
		'https://nodejs.org/en/feed/blog.xml',
		'https://pythoninsider.blogspot.com/rss.xml',
		'https://cprss.s3.amazonaws.com/javascriptweekly.com.xml',
		'https://cprss.s3.amazonaws.com/nodeweekly.com.xml',
		// Frameworks and frontennd tools
		'https://nextjs.org/feed.xml',
		'https://astro.build/rss.xml',
		'https://tailwindcss.com/feeds/feed.xml',
		'https://nuxt.com/blog/rss.xml',
		'https://react.dev/rss.xml',
		'https://blog.vuejs.org/feed.rss',
		// AI but basically programming
		'https://blog.langchain.dev/rss',
		// Developer Platform
		'https://vercel.com/atom',
		'https://stackoverflow.blog/feed',
		'https://blog.replit.com/feed.xml',
		'https://supabase.com/feed.xml',
		'https://blog.stackblitz.com/rss.xml',
		'https://firebase.blog/rss.xml',
		// Platforms
		'https://netflixtechblog.com/feed',
		'https://engineering.atspotify.com/feed',
	],
};

export const RSS_ALERTS: RssCatagory = {
	name: RSS_CATEGORY.ALERTS,
	discordChannelId: '1245007194064293929',
	checkImportance: true,
	sources: ['https://rss.weather.gov.hk/rss/WeatherWarningBulletin.xml'],
};

export const RSS_BLOGS: RssCatagory = {
	name: RSS_CATEGORY.BLOGS,
	discordChannelId: '1245004300300587018',
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
		'https://1link.fun/index.xml',
		{
			url: 'https://sspai.com/feed',
			checkImportance: true,
		},
	],
};

export const RSS_UPDATES: RssCatagory = {
	name: RSS_CATEGORY.UPDATES,
	discordChannelId: '1245045959570755584',
	sources: [
		'https://obsidian.md/feed.xml',
		'https://discord.com/blog/rss.xml',
		'https://brave.com/blog/index.xml',
		'https://blog.chromium.org/rss.xml',
	],
};

export const ALL_RSS_CATAGORIES = [
	RSS_GENERAL,
	RSS_HKG,
	RSS_VIDEOS,
	RSS_TECH,
	RSS_DEV,
	RSS_ALERTS,
	RSS_BLOGS,
];

export const EARLIEST_HOURS = 2;
