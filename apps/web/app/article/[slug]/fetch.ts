import { fetchArticle } from '@ckt1031/db';
import { unstable_cache } from 'next/cache';

export async function getCachedArticle(id: string) {
	const numerID = Number(id);

	const getCache = unstable_cache(async () => fetchArticle(numerID), [id], {
		tags: [id],
		revalidate: 60 * 60 * 24 * 3, // 3 days
	});

	const article = await getCache();

	if (article) {
		article.publishedAt = new Date(article.publishedAt);
	}

	return article;
}
