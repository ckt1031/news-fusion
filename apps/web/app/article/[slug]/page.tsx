import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticlePageContent from './content';
import { getCachedArticle } from './fetch';

export const dynamicParams = true;

interface PageProps {
	params: { slug: string };
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	// read route params
	const article = await getCachedArticle(params.slug);

	if (!article) {
		return {};
	}

	return {
		title: article.title,
		description: article.summary,
		openGraph: {
			title: article.title,
			description: article.summary,
		},
	};
}

export default async function ArticlePage({ params }: PageProps) {
	const article = await getCachedArticle(params.slug);

	if (!article) {
		notFound();
	}

	return <ArticlePageContent data={article} />;
}
