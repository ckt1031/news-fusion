import LoadingComponent from '@/app/components/loading';
import DateSwitcher from '@/app/components/news/date-switcher';
import NewsList from '@/app/components/news/news-list';
import TopicSelection from '@/app/components/news/topic-selection';
import { RSS_CATEGORY } from '@/config/news-sources';
import dayjs from 'dayjs';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export async function generateStaticParams() {
	return Object.values(RSS_CATEGORY).map((p) => ({
		slug: p,
	}));
}

interface PageProps {
	params: { slug: RSS_CATEGORY };
	searchParams: { date?: string };
}

export async function generateMetadata(
	{ params }: PageProps,
	// parent: ResolvingMetadata
): Promise<Metadata> {
	// read route params
	const topic = params.slug;

	const title = `Topic: ${topic}`;
	const description = `AI News about ${topic}`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
		},
		twitter: {
			title,
			description,
			creator: '@cktsun1031',
		},
	};
}

export const runtime = 'nodejs';

export default async function Page({ params, searchParams }: PageProps) {
	const topic = decodeURIComponent(params.slug) as RSS_CATEGORY;

	const serverCurrentDate = dayjs().format('YYYY-MM-DD');

	const queryDate = searchParams.date;

	const date = queryDate
		? dayjs(queryDate).format('YYYY-MM-DD')
		: serverCurrentDate;

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
