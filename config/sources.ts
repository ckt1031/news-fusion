export interface RSSConfigFeed {
	name: string;
	/**
	 * Whether to use the XML content of the feed instead without scraping the original website.
	 */
	useXmlContent?: boolean;
	url: string;
}

export interface RSSConfigCategory {
	id: string;
	name: string;
	feeds: RSSConfigFeed[];
}

export const RSS_CATEGORIES: RSSConfigCategory[] = [
	{
		id: 'world',
		name: 'World',
		feeds: [
			{
				name: 'TIME Magazine',
				useXmlContent: true,
				url: 'https://time.com/feed/',
			},
			{
				name: 'The Guardian',
				url: 'https://www.theguardian.com/world/rss',
			},
			{
				name: 'BBC News',
				url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
			},
			{
				name: 'CNBC',
				url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362',
			},
			{
				name: 'CBS News',
				url: 'https://www.cbsnews.com/latest/rss/world',
			},
			{
				name: 'Fox News',
				useXmlContent: true,
				url: 'https://moxie.foxnews.com/google-publisher/world.xml',
			},
			{
				name: 'NBC News',
				url: 'https://feeds.nbcnews.com/nbcnews/public/world',
			},
			{
				name: 'The Independent',
				url: 'https://www.independent.co.uk/news/world/rss',
			},
			{
				name: 'DW',
				url: 'https://rss.dw.com/atom/rss-en-world',
			},
			{
				name: 'CNN',
				url: 'http://rss.cnn.com/rss/cnn_world.rss',
			},
			{
				name: 'ABC News',
				url: 'https://abcnews.go.com/abcnews/internationalheadlines',
			},
			{
				name: 'Al Jazeera',
				url: 'https://www.aljazeera.com/xml/rss/all.xml',
			},
			{
				name: 'NPR News',
				url: 'https://feeds.npr.org/1004/rss.xml',
			},
			{
				name: 'Yahoo News',
				url: 'https://www.yahoo.com/news/rss/world/',
			},
		],
	},
	{
		id: 'product',
		name: 'Product',
		feeds: [
			{
				name: 'TechRadar',
				useXmlContent: true,
				url: 'https://www.techradar.com/rss',
			},
			{
				name: 'Engadget',
				useXmlContent: true,
				url: 'https://www.engadget.com/rss.xml',
			},
			{
				name: "Tom's Guide",
				useXmlContent: true,
				url: 'https://www.tomsguide.com/feeds/all',
			},
		],
	},
	{
		id: 'finance',
		name: 'Finance',
		feeds: [
			{
				name: 'Yahoo Finance',
				url: 'https://finance.yahoo.com/news/rssindex',
			},
			{
				name: 'BBC Business',
				url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
			},
		],
	},
	{
		id: 'investing',
		name: 'Investing',
		feeds: [
			{
				name: 'Dow Jones',
				url: 'https://feeds.content.dowjones.io/public/rss/mw_bulletins',
			},
			{
				name: 'Dow Jones',
				url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
			},
		],
	},
	{
		id: 'technology',
		name: 'Technology',
		feeds: [
			{
				name: 'The Verge',
				useXmlContent: true,
				url: 'https://www.theverge.com/rss/tech/index.xml',
			},
			{
				name: 'TechCrunch',
				url: 'https://techcrunch.com/feed/',
			},
			{
				name: 'Ars Technica',
				url: 'https://arstechnica.com/feed/',
			},
			{
				name: 'The Register',
				url: 'https://www.theregister.com/headlines.rss',
			},
			{
				name: 'ZDNet',
				url: 'https://www.zdnet.com/news/rss.xml',
			},
		],
	},
	{
		id: 'software',
		name: 'Software',
		feeds: [
			{
				name: 'MacRumors',
				useXmlContent: true,
				url: 'https://feeds.macrumors.com/MacRumors-All',
			},
			{
				name: 'Windows Latest',
				useXmlContent: true,
				url: 'https://www.windowslatest.com/feed/',
			},
			{
				name: '9to5Mac',
				url: 'https://9to5mac.com/feed/',
			},
			{
				name: '9to5Google',
				url: 'https://9to5google.com/feed/',
			},
			{
				name: 'Windows Blog',
				useXmlContent: true,
				url: 'https://blogs.windows.com/feed',
			},
		],
	},
];
