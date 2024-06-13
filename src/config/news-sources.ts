import { YOUTUBE_RSS } from './api';

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
	GENERAL = 'general',
	TECHNOLOGY = 'technology',
	HKG = 'hkg',
	THINKING = 'thinking',
	VIDEOS = 'videos',
	ALERTS = 'alerts',
	DEVELOPER = 'developer',
	UPDATES = 'updates',
	BLOGS = 'blogs',
}

export const RSS_GENERAL: RSSCatacory = {
	name: RSS_CATEGORY.GENERAL,
	discordChannelId: '1245738873787645962',
	channels: [
		//'https://rss.politico.com/politics-news.xml',
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
	checkImportance: false,
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
		`${YOUTUBE_RSS}UCHnyfMqiRRG1u-2MsSQLbXA`, // Veritasium
		`${YOUTUBE_RSS}UCsXVk37bltHxD1rDPwtNM8Q`, // Kurzgesagt – In a Nutshell
		`${YOUTUBE_RSS}UCUHW94eEFW7hkUMVaZz4eDg`, // minutephysics
		`${YOUTUBE_RSS}UCC552Sd-3nyi_tk2BudLUzA`, // AsapSCIENCE
		`${YOUTUBE_RSS}UCFhXFikryT4aFcLkLw2LBLA`, // NileRed
		`${YOUTUBE_RSS}UCEnAit0duntJxa3gZG-paoA`, // NileRedExtra

		// Tech
		`${YOUTUBE_RSS}UCBJycsmduvYEL83R_U4JriQ`, // Marques Brownlee

		// Programming and Tech
		`${YOUTUBE_RSS}UCsBjURrPoezykLs9EqgamOA`, // fireship
		`${YOUTUBE_RSS}UCbRP3c757lWg9M-U7TyEkXA`, // t3dotgg
		`${YOUTUBE_RSS}UCvGwM5woTl13I-qThI4YMCg`, // joshtriedcoding
		`${YOUTUBE_RSS}UC29ju8bIPH5as8OGnQzwJyA`, // TraversyMedia

		/**
		 * Chinese High Quality Channels below
		 */
		`${YOUTUBE_RSS}UC4dtpugIYK56S_7btf5a-iQ`, // lyi 林亦LYi
		`${YOUTUBE_RSS}UCQtwvRQWnT5Buh9hpvNNryQ`, // chaiknowsofficialchannel982 柴知道
		`${YOUTUBE_RSS}UCilwQlk62k1z7aUEZPOB6yw`, // xiao_lin_shuo 小Lin说
		`${YOUTUBE_RSS}UCeUJO1H3TEXu2syfAAPjYKQ`, // geekerwan1024 极客湾 Geekerwan
		`${YOUTUBE_RSS}UCBj9S8TBRlCU4QnhTEOdWZQ`, // axtonliu 回到 Axton
		`${YOUTUBE_RSS}UC2tQpW0dPiyWPebwBSksJ_g`, // NDWTB 脑洞乌托邦
	],
};

export const RSS_TECH: RSSCatacory = {
	name: RSS_CATEGORY.TECHNOLOGY,
	discordChannelId: '1245004214678061096',
	channels: [
		'https://blog.google/rss',
		'https://9to5mac.com/feed',
		'https://9to5linux.com/feed',
		'https://9to5google.com/feed',
		'https://techcrunch.com/feed',
		'https://www.geekwire.com/feed',
		'https://www.engadget.com/rss.xml',
		'https://arstechnica.com/feed',
		'https://www.wired.com/feed/rss',
		'https://www.zdnet.com/news/rss.xml',
		'https://www.theverge.com/rss/index.xml',
		'https://www.theregister.com/headlines.rss',
		'https://rss.slashdot.org/Slashdot/slashdotMainatom', // Only Atom 1.0 is parsable in my code
		{
			url: 'https://research.microsoft.com/rss/news.xml',
			checkImportance: false,
		},
		// AI
		'https://lastweekin.ai/feed',
		{
			url: 'https://huggingface.co/blog/feed.xml',
			checkImportance: false,
		},
		'https://jina.ai/feed.rss',

		// Chinese:
		'https://feeds.feedburner.com/unwirelife',
	],
};

export const RSS_SCIENCE: RSSCatacory = {
	name: RSS_CATEGORY.TECHNOLOGY,
	discordChannelId: '1248298490170441728',
	channels: [
		'https://rss.sciencedaily.com/all.xml',
		'https://www.newscientist.com/feed/home',
		'https://www.scientificamerican.com/platform/syndication/rss',
	],
};

export const RSS_DEV: RSSCatacory = {
	name: RSS_CATEGORY.DEVELOPER,
	discordChannelId: '1245006701812387890',
	checkImportance: false,
	channels: [
		'https://stability.ai/news?format=rss',
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
		// Frameworks and frontend tools
		'https://nextjs.org/feed.xml',
		'https://astro.build/rss.xml',
		'https://tailwindcss.com/feeds/feed.xml',
		'https://nuxt.com/blog/rss.xml',
		'https://react.dev/rss.xml',
		'https://blog.vuejs.org/feed.rss',
		'https://web.dev/static/blog/feed.xml',
		'https://turbo.build/feed.xml',
		'https://blog.google/products/chrome/rss',
		// AI
		'https://blog.langchain.dev/rss',
		'https://qwenlm.github.io/blog/index.xml',
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
	checkImportance: false,
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
		'https://antfu.me/feed.xml',
		'https://1byte.io/articles/index.xml',
		{
			url: 'https://sspai.com/feed',
			checkImportance: true,
		},
		'https://feed.miantiao.me',
		'https://blog.krdw.site/rss.xml',
		'https://diygod.cc/feed',
		{
			url: 'https://www.ifanr.com/feed',
			checkImportance: true,
		},
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
	RSS_ALERTS,
	RSS_TECH,
	RSS_SCIENCE,
	RSS_THINKING,
	RSS_VIDEOS,
	RSS_DEV,
	RSS_BLOGS,
	RSS_UPDATES,
	RSS_GENERAL,
	RSS_HKG,
];

export const EARLIEST_HOURS = 3;
