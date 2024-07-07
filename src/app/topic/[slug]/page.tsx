import { parseDateRange } from '@/app/components/news/get-date-server';
import NewsList from '@/app/components/news/list';
import SkeletonCard from '@/app/components/skeleton/card';
import SkeletonNewsList from '@/app/components/skeleton/news-list';
import type { HomeSearchParamsProps } from '@/app/page';
import captialTopicName from '@/app/utils/captial-topic-name';
import { getAllNewsCatagorySlug } from '@/app/utils/news-catagory';
import type { RSS_CATEGORY } from '@/config/news-sources';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const TopicSelection = dynamic(
	() => import('@/app/components/news/topic-selection'),
	{
		ssr: false,
		loading: () => <SkeletonCard className="my-1" />,
	},
);

const DateSwitcher = dynamic(
	() => import('@/app/components/news/date-switcher'),
	{
		ssr: false,
		loading: () => <SkeletonCard className="my-1 h-[40px]" />,
	},
);

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
