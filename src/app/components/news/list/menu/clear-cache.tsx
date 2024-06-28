'use client';

import {
	AlertDialogFooter,
	AlertDialogHeader,
} from '@/app/components/ui/alert-dialog';
import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import { toast } from '@/app/components/ui/use-toast';
import { useNewsStore } from '@/app/store/news';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { Eraser } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { clearCacheAction } from '../../actions/clear-cache';
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
	const { isExecuting, executeAsync } = useAction(clearCacheAction);

	const pageData = useNewsStore((state) => state.pageData);

	const onClearCache = async () => {
		const result = await executeAsync({
			date: pageData.date,
			from: pageData.from,
			to: pageData.to,
			topic: pageData.topic,
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
