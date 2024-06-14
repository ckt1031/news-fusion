'use client';

import { ExternalLink, RotateCw } from 'lucide-react';
import { useState } from 'react';
import Markdown from 'react-markdown';
import { Button } from '../ui/button';
import type { fetchNews } from './news-list';
import PublisherComponent from './publisher';
import TimeComponent from './time-component';
import '@/app/styles/markdown.css';
import { useToast } from '../ui/use-toast';
import { reGenerateSummary } from './actions/re-generate-summary';

interface Props {
	date: string;
	topic: string;
	article: Awaited<ReturnType<typeof fetchNews>>[0];
	isLoggedIn: boolean;
}

export default function NewsSection({
	article,
	isLoggedIn,
	date,
	topic,
}: Props) {
	const { toast } = useToast();

	const [displayDetail, setDisplayDetail] = useState(false);
	const [summary, setSummary] = useState(article.summary);

	const onGenerateSummary = async () => {
		const result = await reGenerateSummary({
			guid: article.guid,
			url: article.url,
			date,
			topic,
		});
		if (result?.serverError || result?.validationErrors || !result?.data) {
			toast({
				variant: 'destructive',
				title: 'Summarization Error',
				description:
					result?.serverError ||
					'An error occurred while summarizing the article',
			});
			return;
		}

		setSummary(result.data);
	};

	return (
		<>
			<div className="flex flex-col lg:flex-row justify-between lg:items-center">
				<div className="flex flex-col">
					<button
						className="text-left"
						type="button"
						onClick={() => setDisplayDetail(!displayDetail)}
					>
						<p className="text-gray-700 dark:text-gray-300 font-medium">
							{article.title}
						</p>
					</button>
					<PublisherComponent
						className="mt-1 text-gray-500 dark:text-gray-400 text-sm hidden lg:block"
						publisher={article.publisher}
						url={article.url}
					/>
				</div>
				<div className="flex flex-row gap-2 lg:flex-col lg:ml-2 items-center mt-1">
					<PublisherComponent
						className="text-gray-500 dark:text-gray-400 text-sm visible lg:hidden"
						publisher={article.publisher}
						url={article.url}
					/>
					<TimeComponent
						className="text-gray-400 dark:text-gray-500 text-sm text-nowrap"
						time={article.publishedAt}
					/>
				</div>
			</div>
			{displayDetail && (
				<div className="mt-2">
					{summary.length > 0 && (
						<Markdown className="text-gray-600 dark:text-gray-400 prose prose-sm prose-neutral markdown-style">
							{summary}
						</Markdown>
					)}
					<div className="flex flex-row gap-2 mt-2">
						<Button
							variant="ghost"
							className=""
							onClick={() => {
								window.open(article.url, '_blank');
							}}
						>
							<ExternalLink className="h-4 w-4 mr-2" />
							Read more
						</Button>
						{isLoggedIn && (
							<Button variant="ghost" className="" onClick={onGenerateSummary}>
								<RotateCw className="h-4 w-4 mr-2" />
								Generate summary
							</Button>
						)}
					</div>
				</div>
			)}
		</>
	);
}
