'use client';

import { Eraser, Loader2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { Button } from '../ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../ui/tooltip';
import { toast } from '../ui/use-toast';
import { clearCacheAction } from './actions/clear-cache';

export default function ClearCache({
	date,
	topic,
}: { date: string; topic: string }) {
	const { isExecuting: isClearingCache, executeAsync: executeClearCache } =
		useAction(clearCacheAction);

	const onClearCache = async () => {
		const result = await executeClearCache({
			date,
			topic,
		});

		if (result?.serverError || result?.validationErrors) {
			toast({
				variant: 'destructive',
				title: 'Cache Clearing Error',
				description:
					result?.serverError || 'An error occurred while clearing the cache',
			});
			return;
		}

		toast({
			description: 'Cache cleared successfully',
		});
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Button size="sm" className="mt-2" onClick={onClearCache}>
						{isClearingCache ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Eraser className="h-4 w-4 lg:mr-2" />
						)}
						<span className="hidden lg:block">Clear Cache</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent align="end">
					<p>Clear the cache for latest data.</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
