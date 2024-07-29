import type { HomeSearchParamsProps } from '@/app/(news)/page';
import { parseDateRange } from '@/components/news/get-date-server';
import NewsList from '@/components/news/list';
import TopicSelection from '@/components/news/topic-selection';
import SkeletonNewsList from '@/components/skeleton/news-list';
import captialTopicName from '@/utils/captial-topic-name';
import { getAllNewsCategorySlug } from '@/utils/news-category';
import type { RSS_CATEGORY } from '@ckt1031/config';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export function generateStaticParams() {
	return getAllNewsCategorySlug();
}

interface PageProps {
	params: { slug: RSS_CATEGORY };
	searchParams: HomeSearchParamsProps;
}

export const dynamicParams = false;

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	// read route params
	const topic = params.slug;

	const title = `Topic: ${captialTopicName(topic)}`;

	return {
		title,
		openGraph: {
			title,
		},
		twitter: {
			title,
		},
	};
}

export default async function TopicPage({ params, searchParams }: PageProps) {
	const topic = decodeURIComponent(params.slug) as RSS_CATEGORY;

	const date = parseDateRange(searchParams);

	return (
		<>
			<TopicSelection topic={topic} />
			<Suspense fallback={<SkeletonNewsList />}>
				<NewsList category={topic} date={date} />
			</Suspense>
		</>
	);
}
