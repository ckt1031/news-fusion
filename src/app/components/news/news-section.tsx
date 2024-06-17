'use client';

import { Button } from '@/app/components/ui/button';
import { ExternalLink, Loader2, RotateCw } from 'lucide-react';
import { useState } from 'react';
import Markdown from 'react-markdown';
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
import { useToast } from '@/app/components/ui/use-toast';
import { useAction } from 'next-safe-action/hooks';
import Link from 'next/link';
import { reGenerateSummary } from './actions/re-generate-summary';
import TranslateButton from './translate-button';

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

	const { isExecuting: isGeneratingSummary, executeAsync: executeSummarize } =
		useAction(reGenerateSummary);

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
		toast({
			description: `Generating summary for "${article.title}"...`,
		});
		const result = await executeSummarize({
			guid: article.guid,
			url: article.url,
			date,
			topic,
		});
		if (onActionError(result)) return;
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		setSummary(result?.data!);
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
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Link
									href={article.url}
									passHref
									target="_blank"
									rel="noopener noreferrer"
									className="underline flex flex-row items-center mb-1"
								>
									<ExternalLink className="h-4 w-4 mr-2" />
									Read more
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								<p>{article.url}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					{summary.length > 0 && (
						<Markdown className="text-gray-600 dark:text-gray-400 prose prose-sm prose-neutral markdown-style max-w-full">
							{summary}
						</Markdown>
					)}
					<div className="flex flex-row gap-2 mt-2 flex-wrap">
						{isLoggedIn && (
							<>
								<Button
									variant="ghost"
									onClick={onGenerateSummary}
									disabled={isGeneratingSummary}
								>
									{isGeneratingSummary ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<RotateCw className="h-4 w-4 mr-2" />
									)}
									Generate summary
								</Button>
								<TranslateButton
									article={article}
									{...{ title, summary, setSummary, setTitle, onActionError }}
								/>
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
}
