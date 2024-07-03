import { fetchSharedArticles } from '@/lib/db';
import type { User } from '@supabase/supabase-js';
import { serverAuthState } from '../hooks/auth';
import getSHA256 from '../utils/sha256';
import { redis } from '../utils/upstash';

const fetchData = async (user: User) => {
	const cacheHash = getSHA256(`${user.id}shared`);

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

	const data = await fetchData(user);

	return (
		<div>
			{data.map((d) => (
				<div key={d.id}>
					<a href={`/share/${d.id}`}>{d.article.title}</a>
					<p>{d.article.publishedAt.toISOString()}</p>
				</div>
			))}
		</div>
	);
}
