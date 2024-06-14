'use client';

import { ExternalLink, Languages, RotateCw } from 'lucide-react';
import { useState } from 'react';
import Markdown from 'react-markdown';
import { Button } from '../ui/button';
import type { fetchNews } from './news-list';
import PublisherComponent from './publisher';
import TimeComponent from './time-component';
import '@/app/styles/markdown.css';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { useToast } from '../ui/use-toast';
import { reGenerateSummary } from './actions/re-generate-summary';
import { translateNewsInfo } from './actions/translate';

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
	const [title, setTitle] = useState(article.title);
	const [translated, setTranslated] = useState(false);

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const onActionError = (result: any) => {
		if (result?.serverError || result?.validationErrors || !result?.data) {
			toast({
				variant: 'destructive',
				title: 'Summarization Error',
				description:
					result?.serverError ||
					'An error occurred while summarizing the article',
			});
			return true;
		}
		return false;
	};

	const onGenerateSummary = async () => {
		const result = await reGenerateSummary({
			guid: article.guid,
			url: article.url,
			date,
			topic,
		});
		if (onActionError(result)) return;
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		setSummary(result?.data!);
	};

	const onTranslate = async () => {
		if (translated) {
			setTitle(article.title);
			setSummary(article.summary);
			setTranslated(false);
			return;
		}

		const result = await translateNewsInfo({
			title,
			summary: summary,
		});
		if (onActionError(result)) return;
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		setTitle(result?.data?.title!);
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		setSummary(result?.data?.summary!);

		setTranslated(true);
		toast({
			description: `"${article.title}" has been translated to Chinese`,
		});
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
							{title}
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
					<div className="flex flex-row gap-2 mt-2 flex-wrap">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Button
										variant="ghost"
										onClick={() => {
											window.open(article.url, '_blank');
										}}
									>
										<ExternalLink className="h-4 w-4 mr-2" />
										Read more
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{article.url}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						{isLoggedIn && (
							<>
								<Button variant="ghost" onClick={onGenerateSummary}>
									<RotateCw className="h-4 w-4 mr-2" />
									Generate summary
								</Button>

								<Button variant="ghost" onClick={onTranslate}>
									<Languages className="h-4 w-4 mr-2" />
									{translated ? 'Revert' : 'Translate (zh-tw)'}
								</Button>
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
}
