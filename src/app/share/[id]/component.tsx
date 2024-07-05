'use client';

import '@/app/styles/markdown.css';

import PublisherComponent from '@/app/components/news/list/publisher';
import TimeComponent from '@/app/components/news/list/time-component';
import ReadMore from '@/app/components/news/section/read-more';
import { useAuthStore } from '@/app/store/auth';
import dynamic from 'next/dynamic';
import Markdown from 'react-markdown';
import { useUIStore } from './store';

const YouTubeEmbedComponent = dynamic(
	() => import('@/app/components/news/section/youtube-embed'),
	{
		ssr: false,
	},
);
const ThumbnailPhotoViewer = dynamic(() => import('./photo-viewer'), {
	ssr: false,
});
const SharePageControl = dynamic(() => import('./control'), {
	ssr: false,
});

export default function SharedArticleComponent() {
	const data = useUIStore((s) => s.data);

	const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

	if (!data) return null;

	const article = data.article;

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
			{!isYouTube && data.thumbnail && (
				<ThumbnailPhotoViewer
					src={data.thumbnail}
					alt={article.title}
					className="w-full"
				/>
			)}
			{isYouTube && <YouTubeEmbedComponent url={article.url} />}
			<Markdown className="font-mono mt-2 w-full max-w-3xl text-gray-600 dark:text-gray-400 prose prose-neutral markdown-style">
				{data.longSummary}
			</Markdown>
			{isLoggedIn && (
				<div className="max-w-3xl w-full">
					<SharePageControl />
				</div>
			)}
		</div>
	);
}
