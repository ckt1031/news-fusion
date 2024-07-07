import { serverAuthState } from '@/components/hooks/auth';
import { fetchSharedArticles } from '@/lib/db';
import type { User } from '@supabase/supabase-js';
import { getSummarizedArticlesCacheHash, redis } from '../utils/upstash';
import ListCard from './card';

export const fetchSharedArticleData = async (user: User) => {
	const cacheHash = getSummarizedArticlesCacheHash(user.id);

	type Article = Awaited<ReturnType<typeof fetchSharedArticles>>;
	const cache = await redis.get<Article>(cacheHash);

	if (cache) {
		return cache.map((c) => ({
			...c,
			article: {
				...c.article,
				publishedAt: new Date(c.article.publishedAt),
			},
			createdAt: new Date(c.createdAt),
		}));
	}

	const data = await fetchSharedArticles(user.id);

	await redis.set(cacheHash, data, {
		ex: 60 * 60 * 24, // Cache for 1 day
	});

	return data.map((d) => {
		return {
			...d,
			article: {
				...d.article,
				publishedAt: new Date(d.article.publishedAt),
			},
			createdAt: new Date(d.createdAt),
		};
	});
};

export default async function SharedArticlesListPage() {
	const { user } = await serverAuthState();

	if (!user) return null;

	const data = await fetchSharedArticleData(user);

	return (
		<div className="flex flex-col gap-2 mb-5">
			{data.map((d) => (
				<ListCard key={d.id} d={d} />
			))}
		</div>
	);
}
