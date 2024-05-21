import { NEWS_MINIMALIST_API } from '@/config/news-sources';
import { NewsMinimalistResponse } from '@/types/news-minimalist';
import { type RssFeed, RssFeedSchema } from '@/types/rss';
import type { ArrayElement } from '@/types/utils';
import { XMLParser } from 'fast-xml-parser';

export async function getNewsMinimalistList() {
	const response = await fetch(NEWS_MINIMALIST_API);

	return await NewsMinimalistResponse.parseAsync(await response.json());
}

function filterLastDayNews(
	item: ArrayElement<RssFeed['item']>,
	lastDay: number,
) {
	const pubDate = new Date(item.pubDate);

	if (lastDay < 0) {
		return true;
	}

	const now = new Date();
	const diff = now.getTime() - pubDate.getTime();

	return diff <= lastDay * 24 * 60 * 60 * 1000;
}

export async function parseRSS(url: string, lastDay = -1) {
	console.log('Parsing RSS:', url);

	const req = await fetch(url);

	if (!req.ok) {
		throw new Error(`Failed to fetch RSS: ${url} (${req.status})`);
	}

	const xmlData = await req.text();
	const parser = new XMLParser({
		ignoreAttributes: true,
	});
	const data = parser.parse(xmlData);

	const parsedData = RssFeedSchema.parse(data.feed ?? data.rss.channel);

	return {
		...parsedData,
		item: parsedData.item.filter((item) => filterLastDayNews(item, lastDay)),
	};
}
