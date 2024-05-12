import { XMLParser } from 'fast-xml-parser';
import { decode } from 'html-entities';
import removeTrailingSlash from 'remove-trailing-slash';
import { z } from 'zod';
import { NEWS_MINIMALIST_API } from '../config/news-sources';
import { NewsMinimalistResponse } from '../types/news-minimalist';

export async function getNewsMinimalistList() {
	const response = await fetch(NEWS_MINIMALIST_API);

	return await NewsMinimalistResponse.parseAsync(await response.json());
}

export async function parseRSS(url: string) {
	const req = await fetch(url);
	const xmlData = await req.text();
	const parser = new XMLParser({
		ignoreAttributes: false,
	});
	const data = parser.parse(xmlData);

	const feedItemSchema = z.object({
		title: z.string().transform((title) => decode(title)),
		link: z.string().transform(removeTrailingSlash),
		pubDate: z.string().transform((date) => new Date(date).toISOString()),
		guid: z
			.object({
				'#text': z.string(),
			})
			.or(z.string())
			.transform((guid) => {
				if (typeof guid === 'object') {
					return guid['#text'];
				}
				return guid;
			}),
	});

	const feedSchema = z.object({
		title: z.string(),
		link: z.string().transform(removeTrailingSlash),
		item: z
			.array(feedItemSchema)
			.or(feedItemSchema)
			.transform((item) => {
				if (Array.isArray(item)) {
					return item;
				}
				return [item];
			}),
	});

	return feedSchema.parse(data.rss.channel);
}
