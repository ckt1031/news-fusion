'use client';

import '@/app/styles/markdown.css';

import { useNewsStore } from '@/app/store/news';
import { cn } from '@/app/utils/cn';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Markdown from 'react-markdown';
import LoadingComponent from '../../loading';
import PublisherComponent from '../list/publisher';
import TimeComponent from '../list/time-component';
import NewsSectionDropdownMenu from './menu';
import ReadMore from './read-more';
import NewsSimilarities from './similarities';

const YouTubeEmbedComponent = dynamic(() => import('./youtube-embed'), {
	loading: () => <LoadingComponent />,
});

interface Props {
	guid: string;
}

const summaryClassname =
	'font-mono text-gray-600 dark:text-gray-400 prose prose-sm prose-neutral markdown-style max-w-full';

export default function NewsSection({ guid }: Props) {
	const [displayDetail, setDisplayDetail] = useState(false);

	const baseItem = useNewsStore((state) => state.getItem(guid));
	const displayingItem = useNewsStore((state) => state.getDisplayingItem(guid));

	const isYouTube = new URL(baseItem.url).hostname.includes('youtube.com');

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
							{displayingItem.immersiveTranslate
								? baseItem.title
								: displayingItem.title}
						</p>
						{displayingItem.immersiveTranslate && (
							<p
								className={cn(
									'text-gray-700 dark:text-gray-300 font-medium',
									'border-l-4 border-blue-500 pl-2 my-2', // Add a left border
								)}
							>
								{displayingItem.title}
							</p>
						)}
					</button>
					<PublisherComponent
						className="mt-1 text-gray-500 dark:text-gray-400 text-sm hidden lg:block"
						publisher={baseItem.publisher}
						url={baseItem.url}
					/>
				</div>
				<div className="flex flex-row gap-2 lg:flex-col lg:ml-2 items-center mt-1">
					<PublisherComponent
						className="text-gray-500 dark:text-gray-400 text-sm visible lg:hidden"
						publisher={baseItem.publisher}
						url={baseItem.url}
					/>
					<div className="flex flex-row gap-2">
						<TimeComponent
							className="text-gray-400 dark:text-gray-500 text-sm text-nowrap"
							time={baseItem.publishedAt}
						/>
						<NewsSectionDropdownMenu guid={guid} />
					</div>
				</div>
			</div>
			{displayDetail && (
				<div className="mt-2">
					{isYouTube && <YouTubeEmbedComponent url={baseItem.url} />}
					{!isYouTube && <ReadMore url={baseItem.url} />}
					{displayingItem.summary.length > 0 && (
						<>
							<Markdown className={summaryClassname}>
								{displayingItem.immersiveTranslate
									? baseItem.summary
									: displayingItem.summary}
							</Markdown>
							{displayingItem.immersiveTranslate && (
								<Markdown
									className={cn(
										summaryClassname,
										// Add a left border to the summary
										'border-l-4 border-blue-500 pl-2 my-2', // Add a left border to the summary
									)}
								>
									{displayingItem.summary}
								</Markdown>
							)}
						</>
					)}
					<NewsSimilarities guid={guid} />
				</div>
			)}
		</>
	);
}
