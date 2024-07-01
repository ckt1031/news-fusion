import LoadingComponent from '@/app/components/loading';
import DateSwitcher from '@/app/components/news/date-switcher';
import { parseDateRange } from '@/app/components/news/get-date-server';
import NewsList from '@/app/components/news/list';
import TopicSelection from '@/app/components/news/topic-selection';
import type { HomeSearchParamsProps } from '@/app/page';
import captialTopicName from '@/app/utils/captial-topic-name';
import { RSS_CATEGORY } from '@/config/news-sources';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export async function generateStaticParams() {
	return Object.values(RSS_CATEGORY).map((p) => ({
		slug: p,
	}));
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
			<Suspense fallback={<LoadingComponent />}>
				<NewsList topic={topic} date={date} />
			</Suspense>
		</>
	);
}
