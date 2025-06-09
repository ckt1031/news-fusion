import { RSS_CATEGORIES } from '~~/config/sources';
import type { SitemapUrlInput } from '#sitemap/types';

export default defineSitemapEventHandler(() => {
	const categories = RSS_CATEGORIES.map(
		(category) =>
			({
				loc: `/category/${category.id}`,
				priority: 0.8,
				changefreq: 'hourly',
				lastmod: new Date().toISOString(),
			}) satisfies SitemapUrlInput,
	);

	return categories;
});
