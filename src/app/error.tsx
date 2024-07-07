'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bug, FlipVertical2 } from 'lucide-react';
import type { ErrorComponent } from 'next/dist/client/components/error-boundary';
import { useEffect, useState } from 'react';

const ErrorStack: ErrorComponent = ({ error }) => {
	const [showFullStack, setShowFullStack] = useState(false);

	const message = showFullStack ? error.stack : error.message;

	return (
		<div className="flex flex-col gap-2">
			<Button
				variant="ghost"
				onClick={() => setShowFullStack(!showFullStack)}
				className="w-28"
			>
				<FlipVertical2 className="w-4 h-4" /> Flip Stack
			</Button>
			<ScrollArea className="rounded-md border w-full max-h-96 p-3 overflow-auto">
				<code>{message}</code>
			</ScrollArea>
		</div>
	);
};

const ErrorBlock: ErrorComponent = ({ error, reset }) => {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<Card className="my-3">
			<CardHeader>
				<CardTitle className="flex flex-row gap-2">
					<Bug className="w-6 h-6" />
					An error occurred
				</CardTitle>
				<CardDescription className="flex flex-col gap-3">
					Please try again later
					<ErrorStack error={error} reset={reset} />
					<Button onClick={reset} className="w-28">
						Try again
					</Button>
				</CardDescription>
			</CardHeader>
		</Card>
	);
};

export default ErrorBlock;
