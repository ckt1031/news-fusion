import { authState } from '@/app/hooks/auth';
import dayjs from 'dayjs';
import { ShieldX } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import ClearCache from '../clear-cache';
import NewsSection from '../section';
import { type FetchNewsPageProps, fetchNewsForPage } from './fetch';
import AppInitializer from './initializer';

const ALLOWED_DAYS = 30;

function isDateInAllowedDayRange(date: string) {
	const currentDate = dayjs().format('YYYY-MM-DD');
	const dateToCheck = dayjs(date).format('YYYY-MM-DD');

	return (
		dayjs(dateToCheck).isAfter(
			dayjs(currentDate).subtract(ALLOWED_DAYS, 'day'),
		) && dayjs(dateToCheck).isBefore(dayjs(currentDate).add(2, 'day')) // Timezone issue
	);
}

export default async function NewsList({ topic, date }: FetchNewsPageProps) {
	if (!isDateInAllowedDayRange(date)) {
		return (
			<Card className="my-3">
				<CardHeader>
					<CardTitle className="flex flex-row gap-2">
						<ShieldX className="w-6 h-6" />
						Invalid Date
					</CardTitle>
					<CardDescription>
						You can only view news from the past 30 days
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const sortedArticles = await fetchNewsForPage({ topic, date });

	const { isLoggedIn } = await authState();

	return (
		<AppInitializer news={sortedArticles} pageData={{ date, topic }}>
			<div className="flex flex-row justify-between items-center mb-1">
				<p className="text-gray-500 dark:text-gray-400 text-sm">
					{sortedArticles?.length} articles found
				</p>
				{isLoggedIn && <ClearCache date={date} topic={topic} />}
			</div>
			<div className="mb-4 flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
				{!sortedArticles?.length && (
					<p className="text-gray-500 dark:text-gray-400 text-center py-4">
						No news found for this topic and date
					</p>
				)}
				{sortedArticles?.map((article) => (
					<div key={article.guid} className="py-2 align-middle">
						<NewsSection guid={article.guid} isLoggedIn={isLoggedIn} />
					</div>
				))}
			</div>
		</AppInitializer>
	);
}
