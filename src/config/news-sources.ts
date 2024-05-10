// export const RSS_LINKS = [
//   // The Verge
//   "https://www.theverge.com/tech/rss/index.xml"

// ];

export enum RSS_CATEGORY {
  TECH = 'tech',
}

export const RSS_LINKS = {
  [RSS_CATEGORY.TECH]: [
    // The Verge
    'https://www.theverge.com/tech/rss/index.xml',
    // TechCrunch
    'https://techcrunch.com/feed/',
  ],
};

export const DIRECT_SEND_RSS = [
  'https://weekly.tw93.fun/rss.xml',
  'https://feeds.feedburner.com/ruanyifeng',
];

export const NEWS_MINIMALIST_API = 'https://www.newsminimalist.com/api/get-all-stories';