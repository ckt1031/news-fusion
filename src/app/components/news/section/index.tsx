'use client';

import { useState } from 'react';
import Markdown from 'react-markdown';
import PublisherComponent from '../publisher';
import TimeComponent from '../time-component';
import '@/app/styles/markdown.css';
import { useNewsStore } from '@/app/store/news';
import ReadMore from './read-more';
import SummarizeButton from './summarize';
import TranslateButton from './translate';

interface Props {
	guid: string;
	isLoggedIn: boolean;
}

export default function NewsSection({ isLoggedIn, guid }: Props) {
	const [displayDetail, setDisplayDetail] = useState(false);

	const baseItem = useNewsStore((state) => state.getItem(guid));
	const displayingItem = useNewsStore((state) => state.getDisplayingItem(guid));

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
							{displayingItem.title}
						</p>
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
					<TimeComponent
						className="text-gray-400 dark:text-gray-500 text-sm text-nowrap"
						time={baseItem.publishedAt}
					/>
				</div>
			</div>
			{displayDetail && (
				<div className="mt-2">
					<ReadMore url={baseItem.url} />
					{displayingItem.summary.length > 0 && (
						<Markdown className="text-gray-600 dark:text-gray-400 prose prose-sm prose-neutral markdown-style max-w-full">
							{displayingItem.summary}
						</Markdown>
					)}
					<div className="flex flex-row gap-2 mt-2 flex-wrap">
						{isLoggedIn && (
							<>
								<SummarizeButton guid={guid} />
								<TranslateButton guid={guid} />
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
}
