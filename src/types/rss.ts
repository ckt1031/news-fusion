import { decode as decodeHtmlEntities } from 'html-entities';
import { z } from 'zod';
import removeTrailingSlash from '../lib/remove-trailing-slash';

const CommonRssFeedItemSchema = z
	.object({
		title: z.string().transform((title) => decodeHtmlEntities(title)),
		link: z.string().optional(),
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
	})
	.transform((item) => ({
		// Make format to common format
		title: item.title,
		link: removeTrailingSlash(item.link || item.guid),
		pubDate: item.pubDate,
		guid: item.guid,
	}));

const CommonRssFeedSchema = z.object({
	title: z.string(),
	link: z.string().transform(removeTrailingSlash),
	item: z
		.array(CommonRssFeedItemSchema)
		.or(CommonRssFeedItemSchema)
		.transform((item) => (Array.isArray(item) ? item : [item])),
});

const Alternative1FeedItemSchema = z
	.object({
		title: z
			.object({ '#text': z.string() })
			.or(z.string())
			.transform((title) =>
				typeof title === 'object' ? title['#text'] : title,
			),
		id: z.string().transform(removeTrailingSlash),
		link: z
			.object({ '@_href': z.string() })
			.transform((link) => link['@_href']),
		published: z.string().transform((date) => new Date(date).toISOString()),
	})
	.transform((item) => ({
		// Make format to common format
		title: item.title,
		link: item.link,
		pubDate: item.published,
		guid: item.id,
	}));

const Alternative1FeedSchema = z
	.object({
		title: z.string(),
		link: z
			.object({ '@_rel': z.string(), '@_href': z.string() })
			.array()
			.transform((link) => link[0]['@_href']),
		entry: z
			.array(Alternative1FeedItemSchema)
			.or(Alternative1FeedItemSchema)
			.transform((item) => (Array.isArray(item) ? item : [item])),
	})
	.transform((data) => ({
		// Make format to common format
		title: data.title,
		link: data.link,
		item: data.entry,
	}));

const AtomFeedSchema = z
	.object({
		title: z
			.string()
			.or(z.object({ '#text': z.string() }))
			.transform((title) =>
				typeof title === 'object' ? title['#text'] : title,
			)
			.transform((title) => decodeHtmlEntities(title)),
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
					.transform((title) => decodeHtmlEntities(title)),
				updated: z.string().transform((date) => new Date(date).toISOString()),
			})
			.array(),
	})
	.transform((data) => ({
		// Make format to common format
		title: data.title,
		link: data.id,
		item: data.entry.map((entry) => ({
			title: entry.title,
			link: entry.id,
			pubDate: entry.updated,
			guid: entry.id,
		})),
	}));

export const RssFeedSchema = CommonRssFeedSchema.or(Alternative1FeedSchema).or(
	AtomFeedSchema,
);
