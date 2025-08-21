import { RSS_CATEGORIES } from '~~/config/sources';
import { cachedPublicAPIFeed } from '../cache';

export function isCategoryValid(category: string) {
	return RSS_CATEGORIES.some((c) => c.id === category);
}

export default defineEventHandler(async (event) => {
	const categoryWithFormat = event.context.params?.category || 'all';
	const [category, format] = categoryWithFormat.split('.');

	if (!category || !format) {
		return Response.json({ error: 'Missing category or format' }, { status: 400 });
	}

	const allowedFormats = ['xml', 'atom', 'json'];

	// If format is provided, check if it's valid
	if (format && !allowedFormats.includes(format)) {
		return Response.json({ error: 'Invalid format' }, { status: 400 });
	}

	// If category is not valid, return 400
	if (category !== 'all' && !isCategoryValid(category)) {
		return Response.json({ error: 'Invalid category' }, { status: 400 });
	}

	const { content, contentType } = await cachedPublicAPIFeed(category, format);

	return new Response(content, {
		headers: {
			'Content-Type': `${contentType}; charset=UTF-8`,
		},
	});
});
