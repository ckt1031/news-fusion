import { XMLParser } from 'fast-xml-parser';
import { NEWS_MINIMALIST_API } from '../config/news-sources';
import { NewsMinimalistResponse } from '../types/news-minimalist';
import { RssFeedSchema } from '../types/rss';

export async function getNewsMinimalistList() {
	const response = await fetch(NEWS_MINIMALIST_API);

	return await NewsMinimalistResponse.parseAsync(await response.json());
}

export async function parseRSS(url: string) {
	console.log('Parsing RSS:', url);

	const req = await fetch(url);
	const xmlData = await req.text();
	const parser = new XMLParser({
		ignoreAttributes: false,
	});
	const data = parser.parse(xmlData);

	return RssFeedSchema.parse(data.feed ?? data.rss.channel);
}
