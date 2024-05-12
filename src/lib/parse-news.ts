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
	console.log('Parsing RSS:', url);

	const req = await fetch(url);
	const xmlData = await req.text();
	const parser = new XMLParser({
		ignoreAttributes: false,
	});
	const data = parser.parse(xmlData);

	const rssFeedItemSchema = z.object({
		title: z.string().transform((title) => decode(title)),
		link: z.string().transform(removeTrailingSlash),
		pubDate: z.string().transform((date) => new Date(date).toISOString()),
		guid: z
			.object({
				'#text': z.string(),
			})
			.or(z.string())
			.transform((guid) =>
				typeof guid === 'object'
					? removeTrailingSlash(guid['#text'])
					: removeTrailingSlash(guid),
			),
	});

	const rssFeedSchema = z.object({
		title: z.string(),
		link: z.string().transform(removeTrailingSlash),
		item: z
			.array(rssFeedItemSchema)
			.or(rssFeedItemSchema)
			.transform((item) => (Array.isArray(item) ? item : [item])),
	});

	const isAtom = url.includes('atom');

	if (isAtom) {
		const atomFeedSchema = z.object({
			title: z
				.string()
				.or(z.object({ '#text': z.string() }))
				.transform((title) =>
					typeof title === 'object' ? title['#text'] : title,
				)
				.transform((title) => decode(title)),
			id: z.string().transform(removeTrailingSlash),
			entry: z
				.object({
					id: z.string().transform(removeTrailingSlash),
					// Either string or {"#text": string}
					title: z
						.string()
						.or(z.object({ '#text': z.string() }))
						.transform((title) =>
							typeof title === 'object' ? title['#text'] : title,
						)
						.transform((title) => decode(title)),
					updated: z.string().transform((date) => new Date(date).toISOString()),
				})
				.array(),
		});

		const atomData = atomFeedSchema.parse(data.feed);

		type RssFeedSchema = z.infer<typeof rssFeedSchema>;

		return {
			title: atomData.title,
			link: atomData.id,
			item: atomData.entry.map((entry) => ({
				title: entry.title,
				link: entry.id,
				pubDate: entry.updated,
				guid: entry.id,
			})),
		} satisfies RssFeedSchema;
	}

	return rssFeedSchema.parse(data.rss.channel);
}
