import { fetchArticle } from '@/lib/db';
import { decode } from 'js-base64';
import { notFound } from 'next/navigation';
import type { SharedArticleFetchingReturnProps } from './[id]/schema';
import StateInitializer from './[id]/state-initializer';
import Handler from './handler';

export interface StartingSharePageProps {
	searchParams: {
		articleId: string;
		use_search: number | string;
		custom_instructions: string;
	};
}

export const runtime = 'edge';

export default async function SharePageStarting({
	searchParams,
}: StartingSharePageProps) {
	if (!searchParams.articleId) notFound();

	const articleId = Number(searchParams.articleId);
	const use_search =
		searchParams.use_search === 1 || searchParams.use_search === '1';
	const custom_instructions = decode(
		decodeURIComponent(searchParams.custom_instructions),
	);

	const article = await fetchArticle(articleId);

	if (!article) notFound();

	const shared: NonNullable<SharedArticleFetchingReturnProps> = {
		article,
		id: '',
		userId: '',
		articleId: 0,
		longSummary: '',
		thumbnail: null,
		sources: null,
		createdAt: new Date(),
	};

	return (
		<StateInitializer data={shared}>
			<Handler
				articleId={articleId}
				useSearch={use_search}
				customInstructions={custom_instructions}
			/>
		</StateInitializer>
	);
}
