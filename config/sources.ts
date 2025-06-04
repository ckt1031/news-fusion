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
		id: 'technology',
		name: 'Technology',
		feeds: [
			{
				name: 'The Verge',
				useXmlContent: true,
				url: 'https://www.theverge.com/rss/tech/index.xml',
			},
			// {
			// 	name: 'TechCrunch',
			// 	url: 'https://techcrunch.com/feed/',
			// },
			// {
			// 	name: 'Ars Technica',
			// 	url: 'https://arstechnica.com/feed/',
			// },
		],
	},
];
