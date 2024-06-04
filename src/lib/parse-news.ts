import { type RssFeed, RssFeedSchema } from '@/types/rss';
import { XMLParser } from 'fast-xml-parser';
import { ofetch } from 'ofetch';

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
	const xmlData = await ofetch<string>(url, {
		timeout: 10000, // 10 seconds
	});

	const parser = new XMLParser({
		ignoreAttributes: true,
	});
	const data = parser.parse(xmlData);

	const parsedData = RssFeedSchema.parse(data.feed ?? data.rss.channel);
	const filteredData = parsedData.item.filter((item) =>
		filterLastDayNews(item, pastHours),
	);

	if (typeof process !== 'undefined' && process.env.TESTING === '1') {
		// Also check if URL is valud
		for (const data of parsedData.item) {
			if (!data.link.startsWith('http')) throw 'URL Validation Failed';
		}
	} else {
		console.info(
			`Parsed ${filteredData.length} (Total ${parsedData.item.length}) news from ${url}`,
		);
	}

	return {
		...parsedData,
		item: filteredData,
	};
}
