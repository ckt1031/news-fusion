import { RSS_CATEGORY } from '@/config/news-sources';

export function getAllNewsCatagorySlug() {
	return Object.values(RSS_CATEGORY).map((p) => ({
		slug: p,
	}));
}
