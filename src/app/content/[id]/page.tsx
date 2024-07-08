import LoadingComponent from '@/components/loading';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ArticleComponent from './component';
import fetchCachedArticle from './fetch';
import StateInitializer from './state-initializer';

interface PageProps {
	params: { id: string };
}

export const runtime = 'edge';

function parseId(suffix: string) {
	// Suffix will be <id>-<title>, example: 1102-north-korea-claims-successful-test-of-new-icbm
	// We require the id in path to enhance URL visibility
	return suffix.split('-')[0];
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	// read route params
	const id = Number(parseId(params.id));

	const article = await fetchCachedArticle(id);

	if (!article) {
		return {
			title: 'Not Found',
		};
	}

	return {
		title: article.title,
		...(article.longSummary ? { description: article.longSummary } : {}), // optional
		openGraph: {
			title: article.title,
			...(article.longSummary ? { description: article.longSummary } : {}), // optional
			images: [...(article.thumbnail ? [{ url: article.thumbnail }] : [])],
		},
		twitter: {
			title: article.title,
			...(article.longSummary ? { description: article.longSummary } : {}), // optional
			card: 'summary_large_image',
		},
	};
}

async function ContentComponent({ params }: PageProps) {
	const id = Number(parseId(params.id));
	const article = await fetchCachedArticle(id);

	if (!article) return notFound();

	return (
		<StateInitializer data={article}>
			<ArticleComponent />
		</StateInitializer>
	);
}

export default async function ContentPage({ params }: PageProps) {
	return (
		<Suspense fallback={<LoadingComponent />}>
			<ContentComponent params={params} />
		</Suspense>
	);
}
