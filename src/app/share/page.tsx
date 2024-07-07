import LoadingComponent from '@/components/loading';
import { fetchArticle } from '@/lib/db';
import { decode } from 'js-base64';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { SharedArticleFetchingReturnProps } from './[id]/schema';
import ShareArticleHandlerStateInitializer from './[id]/state-initializer';

const SharedArticlesListPage = dynamic(() => import('./list'), {
	ssr: false,
	loading: () => <LoadingComponent />,
});
const ShareArticleHandler = dynamic(() => import('./handler'), {
	ssr: false,
	loading: () => <LoadingComponent />,
});

export interface StartingSharePageProps {
	searchParams: {
		articleId: string;
		use_search: number | string;
		custom_instructions: string;
	};
}

export const runtime = 'edge';

async function ShareRouter({ searchParams }: StartingSharePageProps) {
	if (!searchParams.articleId) {
		// If no articleId is provided, show the shared articles list
		return <SharedArticlesListPage />;
	}

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
		private: false,
	};

	return (
		<ShareArticleHandlerStateInitializer data={shared}>
			<ShareArticleHandler
				articleId={articleId}
				useSearch={use_search}
				customInstructions={custom_instructions}
			/>
		</ShareArticleHandlerStateInitializer>
	);
}

export default function PageRouter({ searchParams }: StartingSharePageProps) {
	return (
		<Suspense fallback={<LoadingComponent />}>
			<ShareRouter searchParams={searchParams} />
		</Suspense>
	);
}
