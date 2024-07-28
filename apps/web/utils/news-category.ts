import { RSS_CATEGORY } from '@ckt1031/config';

export function getAllNewsCategorySlug() {
	return Object.values(RSS_CATEGORY).map((p) => ({
		slug: p,
	}));
}
