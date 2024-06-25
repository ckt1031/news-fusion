import { YOUTUBE_RSS } from './api';

export type RSSConfig = {
	specificName?: string;

	checkImportance?: boolean;
	/** Default to ture, check importance of income content */
	autoSummarize?: boolean;
	/** Default to ture, this will include buttons such as "Translate" or "Summarize" buttons */
	includeAIButtons?: boolean;

	/** Specify if the content is scrapable or not */
	scrapable?: boolean;
};

export type RSSChannelItem =
	| ({
			url: string;
	  } & RSSConfig)
	| string;
export interface RSSCatacory extends RSSConfig {
	name: RSS_CATEGORY;
	channels: RSSChannelItem[];
}

export enum RSS_CATEGORY {
	GENERAL = 'general',
	AI = 'ai',
	TECHNOLOGY = 'technology',
	SCIENCE = 'science',
	HKG = 'hkg',
	THINKING = 'thinking',
	VIDEOS = 'videos',
	// ALERTS = 'alerts',
	DEVELOPER = 'developer',
	UPDATES = 'updates',
	BLOGS = 'blogs',
	FORUM = 'forum',
}

export const RSS_GENERAL: RSSCatacory = {
	name: RSS_CATEGORY.GENERAL,
	channels: [
		'https://qz.com/rss',
		'https://time.com/feed',
		'https://abcnews.go.com/abcnews/topstories',
		'https://feeds.bbci.co.uk/news/world/rss.xml',
		'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
		'https://feeds.washingtonpost.com/rss/world?itid=lk_inline_manual_35',
		{
			url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362',
			specificName: 'CNBC',
		},
	],
};

export const RSS_HKG: RSSCatacory = {
	name: RSS_CATEGORY.HKG,
	channels: [
		{
			url: 'https://www.scmp.com/rss/2/feed',
			specificName: 'SCMP',
		},
		{
			url: 'https://www.epochtimes.com/b5/nsc415.xml',
			specificName: 'Epoch Times HK',
		},
	],
};

export const RSS_THINKING: RSSCatacory = {
	name: RSS_CATEGORY.THINKING,
	checkImportance: false,
	channels: [
		'https://asteriskmag.com/feed',
		'https://www.nplusonemag.com/feed',
		{ url: 'https://www.newyorker.com/feed/news', specificName: 'New Yorker' },
		'https://api.quantamagazine.org/feed',
		'https://www.noemamag.com/?feed=noemarss',
	],
};

export const RSS_VIDEOS: RSSCatacory = {
	name: RSS_CATEGORY.VIDEOS,
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
		{ url: `${YOUTUBE_RSS}UC4dtpugIYK56S_7btf5a-iQ`, scrapable: false }, // lyi 林亦LYi
		{ url: `${YOUTUBE_RSS}UCQtwvRQWnT5Buh9hpvNNryQ`, specificName: '柴知道' }, // chaiknowsofficialchannel982 柴知道
		`${YOUTUBE_RSS}UCilwQlk62k1z7aUEZPOB6yw`, // xiao_lin_shuo 小Lin说
		`${YOUTUBE_RSS}UCeUJO1H3TEXu2syfAAPjYKQ`, // geekerwan1024 极客湾 Geekerwan
		`${YOUTUBE_RSS}UCBj9S8TBRlCU4QnhTEOdWZQ`, // axtonliu 回到 Axton
		{ url: `${YOUTUBE_RSS}UC2tQpW0dPiyWPebwBSksJ_g`, scrapable: false }, // NDWTB 脑洞乌托邦
	],
};

export const RSS_TECH: RSSCatacory = {
	name: RSS_CATEGORY.TECHNOLOGY,
	channels: [
		'https://blog.google/rss',
		'https://9to5mac.com/feed',
		'https://9to5linux.com/feed',
		'https://9to5google.com/feed',
		'https://techcrunch.com/feed',
		'https://www.geekwire.com/feed',
		{ url: 'https://www.engadget.com/rss.xml', specificName: 'Engadget' },
		'https://arstechnica.com/feed',
		'https://www.wired.com/feed/rss',
		{ url: 'https://www.zdnet.com/news/rss.xml', specificName: 'ZDNet' },
		{
			url: 'https://www.theverge.com/rss/index.xml',
			specificName: 'The Verge',
		},
		'https://www.theregister.com/headlines.rss',
		'https://www.tomsguide.com/feeds/all',
		'https://www.techradar.com/feeds/articletype/news',
		'https://rss.slashdot.org/Slashdot/slashdotMainatom', // Only Atom 1.0 is parsable in my code
	],
};

export const RSS_AI: RSSCatacory = {
	name: RSS_CATEGORY.AI,
	checkImportance: false,
	channels: [
		'https://lastweekin.ai/feed',
		'https://research.microsoft.com/rss/news.xml',
		'https://huggingface.co/blog/feed.xml',
		'https://jina.ai/feed.rss',
		'https://stability.ai/news?format=rss',
		'https://blog.langchain.dev/rss',
		'https://qwenlm.github.io/blog/index.xml',
	],
};

export const RSS_SCIENCE: RSSCatacory = {
	name: RSS_CATEGORY.SCIENCE,
	channels: [
		{
			url: 'https://rss.sciencedaily.com/all.xml',
			specificName: 'Science Daily',
		},
		{
			url: 'https://www.newscientist.com/feed/home',
			specificName: 'New Scientist',
		},
		{
			url: 'https://www.scientificamerican.com/platform/syndication/rss',
			specificName: 'Scientific American',
		},
	],
};

export const RSS_DEV: RSSCatacory = {
	name: RSS_CATEGORY.DEVELOPER,
	checkImportance: false,
	channels: [
		'https://blog.cloudflare.com/rss',
		'https://github.blog/feed',

		'https://www.netlify.com/community-feed.xml',
		'https://www.koyeb.com/feed.xml',
		'https://blog.postman.com/feed',

		'https://www.docker.com/feed',
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

export const RSS_BLOGS: RSSCatacory = {
	name: RSS_CATEGORY.BLOGS,
	checkImportance: false,
	channels: [
		'https://baoyu.io/feed.xml',
		'https://www.appinn.com/feed',
		{ url: 'https://www.wainao.me/rss.xml', scrapable: false },
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
		// 'https://blog.krdw.site/rss.xml',
		'https://diygod.cc/feed',
		{
			url: 'https://www.ifanr.com/feed',
			checkImportance: true,
		},
	],
};

export const RSS_UPDATES: RSSCatacory = {
	name: RSS_CATEGORY.UPDATES,
	checkImportance: false,
	channels: [
		'https://obsidian.md/feed.xml',
		'https://discord.com/blog/rss.xml',
		'https://brave.com/blog/index.xml',
		'https://blog.chromium.org/rss.xml',
	],
};

export const ALL_RSS_CATAGORIES = [
	RSS_AI,
	RSS_DEV,
	RSS_SCIENCE,
	RSS_TECH,
	// RSS_ALERTS,
	RSS_THINKING,
	RSS_VIDEOS,
	RSS_BLOGS,
	RSS_UPDATES,
	RSS_GENERAL,
	RSS_HKG,
];

export const EARLIEST_HOURS = 3;
