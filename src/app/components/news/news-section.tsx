'use client';

import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Markdown from 'react-markdown';
import { Button } from '../ui/button';
import type { fetchNews } from './news-list';
import PublisherComponent from './publisher';
import TimeComponent from './time-component';
import '@/app/styles/markdown.css';

interface Props {
	article: Awaited<ReturnType<typeof fetchNews>>[0];
}

export default function NewsSection({ article }: Props) {
	const [displayDetail, setDisplayDetail] = useState(false);

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
					<Markdown className="text-gray-600 dark:text-gray-400 prose prose-sm prose-neutral markdown-style">
						{article.summary}
					</Markdown>
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
					{/* {article.similarArticles?.length >0 && (
					<div className="mt-2">
						<p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
							Similar articles:
							</p>
							<ul className="list-disc list-inside">
								{article.similarArticles.map((similarArticle) => (
									<li key={similarArticle} className="text-gray-600 dark:text-gray-400 text-sm">
										{similarArticle}
									</li>
								))}
							</ul>
						 </div>
				)} */}
				</div>
			)}
		</>
	);
}
