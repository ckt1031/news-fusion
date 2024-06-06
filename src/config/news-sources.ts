export type RSSConfig = {
	checkImportance?: boolean;
	/** Default to ture, check importance of income content */
	autoSummarize?: boolean;
	/** Default to ture, this will include buttons such as "Translate" or "Summarize" buttons */
	includeAIButtons?: boolean;
};

export type RSSChannelItem =
	| ({
			url: string;
	  } & RSSConfig)
	| string;
export interface RSSCatacory extends RSSConfig {
	name: RSS_CATEGORY;
	channels: RSSChannelItem[];

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

export const RSS_GENERAL: RSSCatacory = {
	name: RSS_CATEGORY.GENERAL,
	discordChannelId: '1245738873787645962',
	channels: [
		'https://rss.politico.com/politics-news.xml',
		'https://feeds.bbci.co.uk/news/world/rss.xml',
	],
};

export const RSS_HKG: RSSCatacory = {
	name: RSS_CATEGORY.HKG,
	discordChannelId: '1245731477048660021',
	channels: ['https://www.scmp.com/rss/2/feed'],
};

export const RSS_THINKING: RSSCatacory = {
	name: RSS_CATEGORY.THINKING,
	discordChannelId: '1245734549879525546',
	channels: [
		'https://asteriskmag.com/feed',
		'https://www.nplusonemag.com/feed',
		'https://www.newyorker.com/feed/news',
		'https://api.quantamagazine.org/feed',
		'https://www.noemamag.com/?feed=noemarss',
	],
};

export const RSS_VIDEOS: RSSCatacory = {
	name: RSS_CATEGORY.VIDEOS,
	discordChannelId: '1245004330868674591',
	checkImportance: false,
	channels: [
		// Science and Education
		'{RSSHUB}/youtube/user/@veritasium', // Veritasium
		'{RSSHUB}/youtube/user/@kurzgesagt', // Kurzgesagt – In a Nutshell
		'{RSSHUB}/youtube/user/@minutephysics', // minutephysics
		'{RSSHUB}/youtube/user/@AsapSCIENCE', // AsapSCIENCE
		'{RSSHUB}/youtube/user/@NileRed', // NileRed
		'{RSSHUB}/youtube/user/@NileRedExtra', // NileRedExtra

		// Tech
		'{RSSHUB}/youtube/user/@mkbhd', // Marques Brownlee

		// Programming and Tech
		'{RSSHUB}/youtube/user/@fireship', // Fireship
		'{RSSHUB}/youtube/user/@t3dotgg', // T3
		'{RSSHUB}/youtube/user/@joshtriedcoding', // Josh tried coding
		'{RSSHUB}/youtube/user/@TraversyMedia', // Traversy Media

		/**
		 * Chinese High Quality Channels below
		 */
		'{RSSHUB}/youtube/user/@lyi', // 林亦LYi
		'{RSSHUB}/youtube/user/@chaiknowsofficialchannel982', // 柴知道
		'{RSSHUB}/youtube/user/@xiao_lin_shuo', // 小Lin说
		'{RSSHUB}/youtube/user/@geekerwan1024', // 极客湾 Geekerwan
		'{RSSHUB}/youtube/user/@axtonliu', // 回到 Axton
		'{RSSHUB}/youtube/user/@NDWTB', // 脑洞乌托邦
	],
};

export const RSS_TECH: RSSCatacory = {
	name: RSS_CATEGORY.TECHNOLOGY,
	discordChannelId: '1245004214678061096',
	channels: [
		'https://blog.google/rss',
		'https://www.theverge.com/rss/index.xml',
		'https://www.theregister.com/headlines.rss',
		{
			url: 'http://research.microsoft.com/rss/news.xml',
			checkImportance: false,
		},
		// AI
		'https://lastweekin.ai/feed',
		{
			url: 'https://huggingface.co/blog/feed.xml',
			checkImportance: false,
		},
		'https://jina.ai/feed.rss',
	],
};

export const RSS_DEV: RSSCatacory = {
	name: RSS_CATEGORY.DEVELOPER,
	discordChannelId: '1245006701812387890',
	checkImportance: false,
	channels: [
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
		'https://blogs.windows.com/msedgedev/feed',
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
		'https://www.freecodecamp.org/news/rss',
		// Platforms
		'https://netflixtechblog.com/feed',
		'https://engineering.atspotify.com/feed',
	],
};

export const RSS_ALERTS: RSSCatacory = {
	name: RSS_CATEGORY.ALERTS,
	discordChannelId: '1245007194064293929',
	checkImportance: true,
	channels: ['https://rss.weather.gov.hk/rss/WeatherWarningBulletin.xml'],
};

export const RSS_BLOGS: RSSCatacory = {
	name: RSS_CATEGORY.BLOGS,
	discordChannelId: '1245004300300587018',
	checkImportance: false,
	channels: [
		'https://baoyu.io/feed.xml',
		'https://www.appinn.com/feed',
		'https://www.wainao.me/rss.xml',
		'https://codechina.org/feed',
		'https://weekly.tw93.fun/rss.xml',
		'https://feeds.feedburner.com/ruanyifeng',
		'https://www.williamlong.info/rss.xml',
		'https://www.owenyoung.com/atom.xml',
		'https://1link.fun/index.xml',
		'https://1byte.io/articles/index.xml',
		{
			url: 'https://sspai.com/feed',
			checkImportance: true,
		},
		'https://feed.miantiao.me',
		'https://blog.krdw.site/rss.xml',
	],
};

export const RSS_UPDATES: RSSCatacory = {
	name: RSS_CATEGORY.UPDATES,
	discordChannelId: '1245045959570755584',
	channels: [
		'https://obsidian.md/feed.xml',
		'https://discord.com/blog/rss.xml',
		'https://brave.com/blog/index.xml',
		'https://blog.chromium.org/rss.xml',
	],
};

export const ALL_RSS_CATAGORIES = [
	RSS_GENERAL,
	RSS_HKG,
	RSS_THINKING,
	RSS_VIDEOS,
	RSS_TECH,
	RSS_DEV,
	RSS_ALERTS,
	RSS_BLOGS,
	RSS_UPDATES,
];

export const EARLIEST_HOURS = 2;
