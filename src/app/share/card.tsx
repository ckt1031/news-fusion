'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/app/components/ui/card';
import dayjs from 'dayjs';
import { useState } from 'react';
import ThumbnailPhotoViewer from './[id]/photo-viewer';
import type { fetchSharedArticleData } from './list';

interface CardProps {
	d: Awaited<ReturnType<typeof fetchSharedArticleData>>[number];
}

function HoldedShortSummary({ summary }: { summary: string }) {
	const [showFull, setShowFull] = useState(false);

	const maxmumLength = 100;

	const firstDisplayText =
		summary.length > maxmumLength
			? `${summary.slice(0, maxmumLength)}...`
			: summary;

	return (
		<>
			<span>
				{showFull ? summary : firstDisplayText}
				{'  '}
			</span>
			<span>
				<button
					type="button"
					onClick={() => setShowFull(!showFull)}
					className="text-black dark:text-white underline"
				>
					{showFull ? 'Show Less' : 'Show More'}
				</button>
			</span>
		</>
	);
}

function SharedDate({ createdAt }: { createdAt: Date }) {
	return <p>{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>;
}

export default function ListCard({ d }: CardProps) {
	return (
		<Card key={d.id}>
			<CardHeader>
				<CardTitle>
					<a href={`/share/${d.id}`}>{d.article.title}</a>
				</CardTitle>
				<CardDescription className="font-mono">
					<HoldedShortSummary summary={d.article.summary} />
				</CardDescription>
			</CardHeader>
			{d.thumbnail && (
				<CardContent>
					<ThumbnailPhotoViewer
						src={d.thumbnail}
						alt={d.article.title}
						className="max-h-40 aspect-video"
					/>
				</CardContent>
			)}
			<CardFooter className="text-gray-700 dark:text-gray-400">
				<SharedDate createdAt={d.createdAt} />
			</CardFooter>
		</Card>
	);
}
