import { YOUTUBE_RSS } from './api';
import { RSS_CATEGORY } from './categories';

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
export interface RSSCategory extends RSSConfig {
	name: RSS_CATEGORY;
	channels: RSSChannelItem[];
}

export const RSS_GENERAL: RSSCategory = {
	name: RSS_CATEGORY.GENERAL,
	channels: [
		'https://qz.com/rss',
		'https://time.com/feed',
		{
			url: 'https://abcnews.go.com/abcnews/topstories',
			specificName: 'ABC News',
		},
		'https://feeds.bbci.co.uk/news/world/rss.xml',
		{
			url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
			specificName: 'UN News',
		},
		'https://feeds.washingtonpost.com/rss/world?itid=lk_inline_manual_35',
		{
			url: 'https://www.theguardian.com/world/rss',
			specificName: 'The Guardian',
		},
	],
};

export const RSS_HKG: RSSCategory = {
	name: RSS_CATEGORY.HKG,
	channels: [
		{
			url: 'https://www.scmp.com/rss/2/feed',
			specificName: 'SCMP',
		},
		{
			url: 'https://rthk9.rthk.hk/rthk/news/rss/e_expressnews_elocal.xml',
			specificName: 'RTHK',
		},
		{
			url: 'https://hongkongfp.com/feed',
			specificName: 'HKFP',
		},
		{
			url: 'https://news.mingpao.com/rss/pns/s00002.xml',
			specificName: 'Ming Pao',
		},
		{
			url: 'https://www.inmediahk.net/rss.xml',
			specificName: 'Indie Media HK',
		},
		{
			url: 'https://orientaldaily.on.cc/rss/news.xml',
			specificName: 'Oriental Daily',
		},
	],
};

export const RSS_CHINA: RSSCategory = {
	name: RSS_CATEGORY.CHINA,
	channels: [
		{
			url: 'https://rthk9.rthk.hk/rthk/news/rss/e_expressnews_elocal.xml',
			specificName: 'RTHK',
		},
		{
			url: 'https://www.scmp.com/rss/4/feed',
			specificName: 'SCMP',
		},
	],
};

export const RSS_THINKING: RSSCategory = {
	name: RSS_CATEGORY.THINKING,
	checkImportance: false,
	channels: [
		'https://asteriskmag.com/feed',
		'https://www.nplusonemag.com/feed',
		{ url: 'https://www.newyorker.com/feed/rss', specificName: 'New Yorker' },
		'https://api.quantamagazine.org/feed',
		'https://www.noemamag.com/?feed=noemarss',
	],
};

export const RSS_VIDEOS: RSSCategory = {
	name: RSS_CATEGORY.VIDEOS,
	checkImportance: false,
	channels: [
		// General for Knowledge
		`${YOUTUBE_RSS}UCAuUUnT6oDeKwE6v1NGQxug`, // TED
		`${YOUTUBE_RSS}UCsN32BtMd0IoByjJRNF12cw`, // 60 minutes

		// Science and Education
		{ url: `${YOUTUBE_RSS}UCbKWv2x9t6u8yZoB3KcPtnw`, scrapable: false }, // Alan Becker
		`${YOUTUBE_RSS}UCHnyfMqiRRG1u-2MsSQLbXA`, // Veritasium
		`${YOUTUBE_RSS}UCsXVk37bltHxD1rDPwtNM8Q`, // Kurzgesagt – In a Nutshell
		`${YOUTUBE_RSS}UCUHW94eEFW7hkUMVaZz4eDg`, // minutephysics
		`${YOUTUBE_RSS}UCC552Sd-3nyi_tk2BudLUzA`, // AsapSCIENCE
		`${YOUTUBE_RSS}UCFhXFikryT4aFcLkLw2LBLA`, // NileRed
		`${YOUTUBE_RSS}UCEnAit0duntJxa3gZG-paoA`, // NileRedExtra
		`${YOUTUBE_RSS}UCeiYXex_fwgYDonaTcSIk6w`, // MinuteEarth
		`${YOUTUBE_RSS}UCR1IuLEqb6UEA_zQ81kwXfg`, // Real Engineering
		`${YOUTUBE_RSS}UCtYKe7-XbaDjpUwcU5x0bLg`, // Neo
		`${YOUTUBE_RSS}UClZbmi9JzfnB2CEb0fG8iew`, // Primal Space
		`${YOUTUBE_RSS}UC2xuUlwK7Vc8aRLsWjfR-bw`, // Codeolences
		`${YOUTUBE_RSS}UC5_Y-BKzq1uW_2rexWkUzlA`, // NewMind
		`${YOUTUBE_RSS}UCdp4_l1vPmpN-gDbUwhaRUQ`, // Branch Education
		`${YOUTUBE_RSS}UCcT_WBynr2K8nANsVrR8BYw`, // LabCoatz Science
		`${YOUTUBE_RSS}UC4QZ_LsYcvcq7qOsOhpAX4A`, // ColdFusion
		`${YOUTUBE_RSS}UC1VLQPn9cYSqx8plbk9RxxQ`, // Action Lab

		// Tech
		`${YOUTUBE_RSS}UCBJycsmduvYEL83R_U4JriQ`, // Marques Brownlee

		// Devices
		`${YOUTUBE_RSS}UCXuqSBlHAE6Xw-yeJA0Tunw`, // Linus Tech Tips
		`${YOUTUBE_RSS}UCqjVP9gAanUGFgTA5BRDvyA`, // HowToMen
		`${YOUTUBE_RSS}UCMiJRAwDNSNzuYeN2uWa0pA`, // Mrwhosetheboss
		`${YOUTUBE_RSS}UCWb-66XSFCV5vgKEbl22R6Q`, // Enderman
		`${YOUTUBE_RSS}UCR-DXc1voovS8nhAvccRZhg`, // Jeff Geerling

		// Security
		`${YOUTUBE_RSS}UCvusD4s2TCDn8M0mkHCh5rA`, // an0n_ali

		// Programming and Tech
		`${YOUTUBE_RSS}UCZgt6AzoyjslHTC9dz0UoTw`, // ByteGo
		`${YOUTUBE_RSS}UCsBjURrPoezykLs9EqgamOA`, // fireship
		`${YOUTUBE_RSS}UCbRP3c757lWg9M-U7TyEkXA`, // t3dotgg
		`${YOUTUBE_RSS}UCvGwM5woTl13I-qThI4YMCg`, // joshtriedcoding
		`${YOUTUBE_RSS}UC29ju8bIPH5as8OGnQzwJyA`, // TraversyMedia
		`${YOUTUBE_RSS}UCqQgfSuhEBOZth3wR9dIzJQ`, // Giannhsnt
		`${YOUTUBE_RSS}UC-T8W79DN6PBnzomelvqJYw`, // JamesQQuick

		/**
		 * Chinese High Quality Channels below
		 */
		{ url: `${YOUTUBE_RSS}UC4dtpugIYK56S_7btf5a-iQ`, scrapable: false }, // lyi 林亦LYi
		{ url: `${YOUTUBE_RSS}UCQtwvRQWnT5Buh9hpvNNryQ`, specificName: '柴知道' }, // chaiknowsofficialchannel982 柴知道
		`${YOUTUBE_RSS}UCilwQlk62k1z7aUEZPOB6yw`, // xiao_lin_shuo 小Lin说
		`${YOUTUBE_RSS}UCeUJO1H3TEXu2syfAAPjYKQ`, // geekerwan1024 极客湾 Geekerwan
		`${YOUTUBE_RSS}UCBj9S8TBRlCU4QnhTEOdWZQ`, // axtonliu 回到 Axton
		`${YOUTUBE_RSS}UCuHHKbwC0TWjeqxbqdO-N_g`, // PanSci 泛科学
		`${YOUTUBE_RSS}UC2cRwTuSWxxEtrRnT4lrlQA`, // 影视飓风
		// { url: `${YOUTUBE_RSS}UC2tQpW0dPiyWPebwBSksJ_g`, scrapable: false }, // NDWTB 脑洞乌托邦
	],
};

export const RSS_TECH: RSSCategory = {
	name: RSS_CATEGORY.TECHNOLOGY,
	channels: [
		'https://blog.google/rss',
		'https://9to5mac.com/feed',
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
		'https://www.eff.org/rss/updates.xml',
		'https://mashable.com/feeds/rss/tech',
		'https://readwrite.com/feed',
		'https://gizmodo.com/feed',
		'https://www.technologyreview.com/feed',
	],
};

//https://github.com/foorilla/allainews_sources?tab=readme-ov-file
export const RSS_AI: RSSCategory = {
	name: RSS_CATEGORY.AI,
	checkImportance: false,
	channels: [
		'https://openrss.org/openai.com/news',
		'https://unwindai.substack.com/feed',
		'https://rss.beehiiv.com/feeds/2R3C6Bt5wj.xml',
		'https://thegradient.pub/rss',
		'https://the-decoder.com/feed',
		'https://www.artificialintelligence-news.com/feed',
		'https://www.databricks.com/feed',
		{
			url: 'https://nvidianews.nvidia.com/releases.xml',
			specificName: 'NVIDIA',
		},
		'https://lastweekin.ai/feed',
		{
			url: 'https://research.microsoft.com/rss/news.xml',
			specificName: 'Microsoft Research',
		},
		'https://huggingface.co/blog/feed.xml',
		'https://jina.ai/feed.rss',
		'https://stability.ai/news?format=rss',
		'https://blog.langchain.dev/rss',
		'https://qwenlm.github.io/blog/index.xml',
	],
};

export const RSS_SCIENCE: RSSCategory = {
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
		{
			url: 'https://www.theguardian.com/science/rss',
			specificName: 'The Guardian',
		},
	],
};

export const RSS_DEV: RSSCategory = {
	name: RSS_CATEGORY.DEVELOPER,
	checkImportance: false,
	channels: [
		{
			url: 'https://dev.to/feed',
			specificName: 'Dev.to',
			checkImportance: true,
		},
		'https://blog.codepen.io/feed',
		'https://engineering.fb.com/feed',
		'https://blog.twitter.com/engineering/en_us/blog.rss',
		'https://instagram-engineering.com/feed',
		'https://auth0.com/blog/rss.xml',
		'https://feed.infoq.com',
		// Vulnarability
		'https://blog.qualys.com/feed',

		'https://9to5linux.com/feed',

		'https://blog.cloudflare.com/rss',
		'https://github.blog/feed',

		'https://www.netlify.com/community-feed.xml',
		'https://www.koyeb.com/feed.xml',
		'https://blog.postman.com/feed',

		'https://www.docker.com/feed',
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

		'https://www.figma.com/blog/feed/atom.xml',
	],
};

export const RSS_BLOGS: RSSCategory = {
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
		//{
		//	url: 'https://sspai.com/feed',
		//	checkImportance: true,
		//},
		//'https://feed.miantiao.me',
		// 'https://blog.krdw.site/rss.xml',
		'https://diygod.cc/feed',
		//{
		//	url: 'https://www.ifanr.com/feed',
		//	checkImportance: true,
		//},
	],
};

export const RSS_UPDATES: RSSCategory = {
	name: RSS_CATEGORY.UPDATES,
	checkImportance: false,
	channels: [
		'https://obsidian.md/feed.xml',
		'https://discord.com/blog/rss.xml',
		'https://blog.chromium.org/rss.xml',
		'https://brave.com/feed',
		'https://spreadprivacy.com/rss',
		'https://blogs.windows.com/msedgedev/feed',
	],
};

export const ALL_RSS_CATEGORIES = [
	RSS_AI,
	RSS_DEV,
	RSS_SCIENCE,
	RSS_TECH,
	RSS_THINKING,
	RSS_VIDEOS,
	RSS_BLOGS,
	RSS_UPDATES,
	RSS_GENERAL,
	RSS_HKG,
	RSS_CHINA,
];

export const EARLIEST_HOURS = 12;
