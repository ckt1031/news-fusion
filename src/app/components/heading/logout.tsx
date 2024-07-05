'use client';

import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import { useToast } from '@/app/components/ui/use-toast';
import { createSupabaseBrowserClient } from '@/app/utils/supabase/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LogOutMenuItem() {
	return (
		<AlertDialogTrigger asChild>
			<DropdownMenuItem>
				<LogOut className="mr-2 h-4 w-4" />
				<span>Log Out</span>
			</DropdownMenuItem>
		</AlertDialogTrigger>
	);
}

export function LogOutDialog() {
	const { toast } = useToast();
	const router = useRouter();
	const client = createSupabaseBrowserClient();

	const handleLogOut = async () => {
		await client.auth.signOut();
		router.refresh();
		toast({ description: 'You have been logged out' });
	};

	return (
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
				<AlertDialogDescription>
					This action cannot be undone. You will lose access to private
					features.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
				<AlertDialogAction onClick={handleLogOut}>Continue</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}
