import LoadingComponent from '@/components/loading';
import { getSharedArticle } from '@/lib/db';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import SharedArticleComponent from './component';
import StateInitializer from './state-initializer';

interface PageProps {
	params: { id: string };
}

export const runtime = 'edge';

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	// read route params
	const id = params.id;

	const shared = await getSharedArticle(id);

	if (!shared) {
		return {
			title: 'Not Found',
		};
	}

	return {
		title: shared.article.title,
		description: shared.longSummary,
		openGraph: {
			title: shared.article.title,
			description: shared.longSummary,
			images: [...(shared.thumbnail ? [{ url: shared.thumbnail }] : [])],
		},
		twitter: {
			title: shared.article.title,
			description: shared.longSummary,
			card: 'summary_large_image',
		},
	};
}

async function ShareContent({ params }: PageProps) {
	const id = params.id;
	const shared = await getSharedArticle(id);

	if (!shared) return notFound();

	return (
		<StateInitializer data={shared}>
			<SharedArticleComponent />
		</StateInitializer>
	);
}

export default async function SharePage({ params }: PageProps) {
	return (
		<Suspense fallback={<LoadingComponent />}>
			<ShareContent params={params} />
		</Suspense>
	);
}
