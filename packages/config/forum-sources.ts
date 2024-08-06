import { RSS_CATEGORY } from './categories';
import type { RSSCategory } from './news-sources';

export const HACKER_NEWS: RSSCategory = {
	name: RSS_CATEGORY.FORUM,
	specificName: 'Hacker News',
	channels: [
		'https://hnrss.org/best',
		// 'https://hnrss.org/newest',
		'https://hnrss.org/frontpage',
	],
};

export const LOBSTE_RS: RSSCategory = {
	name: RSS_CATEGORY.FORUM,
	specificName: 'Lobste.rs',
	channels: [
		'https://lobste.rs/t/ai,event,web.rss',
		'https://lobste.rs/t/security,release.rss',
		'https://lobste.rs/t/science,math,education.rss',
		'https://lobste.rs/t/compsci,programming,hardware.rss',
	],
};

export const DEV_TO = ['https://dev.to/feed/latest'];
