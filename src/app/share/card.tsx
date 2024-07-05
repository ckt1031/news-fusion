'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/app/components/ui/card';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/app/components/ui/tooltip';
import dayjs from 'dayjs';
import { useState } from 'react';
import sAgo from 's-ago';
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
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<p className="italic">Shared {sAgo(createdAt)}</p>
				</TooltipTrigger>
				<TooltipContent align="start">
					<p>{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
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
			<CardContent className="text-gray-700 dark:text-gray-400">
				<SharedDate createdAt={d.createdAt} />
			</CardContent>
		</Card>
	);
}
