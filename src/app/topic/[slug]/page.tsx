import type { HomeSearchParamsProps } from '@/app/page';
import captialTopicName from '@/app/utils/captial-topic-name';
import { getAllNewsCatagorySlug } from '@/app/utils/news-catagory';
import DateSwitcher from '@/components/news/date-switcher';
import { parseDateRange } from '@/components/news/get-date-server';
import NewsList from '@/components/news/list';
import TopicSelection from '@/components/news/topic-selection';
import SkeletonNewsList from '@/components/skeleton/news-list';
import type { RSS_CATEGORY } from '@/config/news-sources';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export async function generateStaticParams() {
	return getAllNewsCatagorySlug();
}

interface PageProps {
	params: { slug: RSS_CATEGORY };
	searchParams: HomeSearchParamsProps;
}

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
			<DateSwitcher />
			<TopicSelection topic={topic} />
			<Suspense fallback={<SkeletonNewsList />}>
				<NewsList topic={topic} date={date} />
			</Suspense>
		</>
	);
}
