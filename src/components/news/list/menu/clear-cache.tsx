'use client';

import { useNewsStore } from '@/components/store/news/items';
import {
	AlertDialogFooter,
	AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { Eraser } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { clearBookmarksCacheAction } from '../../actions/bookmark';
import { clearTopicNewsPageCacheAction } from '../../actions/clear-cache';
import { useUIStore } from './store';

export function ClearCacheButton() {
	const setDialog = useUIStore((state) => state.setDialog);

	const onClick = () => {
		setDialog('clear-cache');
	};

	return (
		<AlertDialogTrigger>
			<DropdownMenuItem onClick={onClick}>
				<Eraser className="h-4 w-4 mr-2" />
				Clear Cache
			</DropdownMenuItem>
		</AlertDialogTrigger>
	);
}

export function ClearCacheDialog() {
	const type = useNewsStore((state) => state.type);

	const action =
		type === 'bookmarks'
			? clearBookmarksCacheAction
			: clearTopicNewsPageCacheAction;

	// @ts-ignore
	const { isExecuting, executeAsync } = useAction(action);

	const pageData = useNewsStore((state) => state.pageData);

	const onClearCache = async () => {
		const dateOptions =
			typeof pageData?.date === 'string'
				? { date: pageData.date }
				: {
						from: pageData?.date.from,
						to: pageData?.date.to,
					};

		const result = await executeAsync({
			topic: pageData?.topic,
			...(pageData?.date && dateOptions),
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
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
				<AlertDialogDescription>
					This action cannot be undone. You will lose the caching of the current
					page.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
				<AlertDialogAction onClick={onClearCache} disabled={isExecuting}>
					Continue
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}
