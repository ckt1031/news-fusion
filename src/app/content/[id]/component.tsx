'use client';

import '@/styles/markdown.css';

import PublisherComponent from '@/components/news/list/publisher';
import TimeComponent from '@/components/news/list/time-component';
import ReadMore from '@/components/news/section/read-more';
import { useAuthStore } from '@/components/store/auth';
import dynamic from 'next/dynamic';
import Markdown from 'react-markdown';
import BriefSummaryBox from './brief-summary';
import { useUIStore } from './store';

const YouTubeEmbedComponent = dynamic(
	() => import('@/components/news/section/youtube-embed'),
);
const ThumbnailPhotoViewer = dynamic(() => import('./photo-viewer'));
const SharePageControl = dynamic(() => import('./control'));

export default function ArticleComponent() {
	const article = useUIStore((s) => s.data);
	const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

	if (!article) return null;

	const isYouTube = new URL(article.url).hostname.includes('youtube.com');

	return (
		<div className="mt-2 mb-5 flex flex-col w-full justify-center items-center gap-3">
			<h1 className="text-2xl md:text-3xl font-bold text-center">
				{article.title}
			</h1>
			<div className="flex flex-row gap-2">
				<PublisherComponent publisher={article.publisher} url={article.url} />
				<TimeComponent
					className="text-gray-400 dark:text-gray-500 text-sm text-nowrap"
					time={article.publishedAt}
				/>
			</div>
			<ReadMore url={article.url} />
			{!isYouTube && article.thumbnail && (
				<ThumbnailPhotoViewer
					src={article.thumbnail}
					alt={article.title}
					className="w-full"
				/>
			)}
			{isYouTube && <YouTubeEmbedComponent url={article.url} />}
			<BriefSummaryBox summary={article.summary} />
			<Markdown className="font-mono mt-2 w-full max-w-3xl text-gray-600 dark:text-gray-400 prose prose-neutral markdown-style">
				{article.longSummary}
			</Markdown>
			{isLoggedIn && (
				<div className="max-w-3xl w-full">
					<SharePageControl />
				</div>
			)}
		</div>
	);
}
