import { type RssFeed, RssFeedSchema } from '@/types/rss';
import { XMLParser } from 'fast-xml-parser';

function filterLastDayNews(
	item: ArrayElement<RssFeed['item']>,
	pastHours: number,
) {
	const pubDate = new Date(item.pubDate);

	if (pastHours === -1) {
		return true;
	}

	const now = new Date();
	const diff = now.getTime() - pubDate.getTime();
	const diffHours = diff / 1000 / 60 / 60;

	return diffHours <= pastHours;
}

export async function parseRSS(url: string, pastHours = -1) {
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
	const filteredData = parsedData.item.filter((item) =>
		filterLastDayNews(item, pastHours),
	);

	console.info(
		`Parsed ${filteredData.length} (Total ${parsedData.item.length}) news from ${url}`,
	);

	return {
		...parsedData,
		item: filteredData,
	};
}
