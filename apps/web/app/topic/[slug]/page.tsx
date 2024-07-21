import type { HomeSearchParamsProps } from '@/app/page';
import DateSwitcher from '@/components/news/date-switcher';
import { parseDateRange } from '@/components/news/get-date-server';
import NewsList from '@/components/news/list';
import TopicSelection from '@/components/news/topic-selection';
import SkeletonNewsList from '@/components/skeleton/news-list';
import captialTopicName from '@/utils/captial-topic-name';
import { getAllNewsCatagorySlug } from '@/utils/news-catagory';
import type { RSS_CATEGORY } from '@ckt1031/config';
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

export const runtime = 'nodejs';

export default async function TopicPage({ params, searchParams }: PageProps) {
	const topic = decodeURIComponent(params.slug) as RSS_CATEGORY;

	const date = parseDateRange(searchParams);

	return (
		<>
			<DateSwitcher />
			<TopicSelection topic={topic} />
			<Suspense fallback={<SkeletonNewsList />}>
				<NewsList catagory={topic} date={date} />
			</Suspense>
		</>
	);
}
