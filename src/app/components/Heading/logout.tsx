'use client';

import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import { createSupabaseBrowserClient } from '@/app/utils/supabase/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogOutMenuItem() {
	const router = useRouter();

	const client = createSupabaseBrowserClient();
	return (
		<DropdownMenuItem
			onClick={async () => {
				await client.auth.signOut();
				// Reload the page to ensure the user is logged out
				router.refresh();
			}}
		>
			<LogOut className="mr-2 h-4 w-4" />
			<span>Log Out</span>
		</DropdownMenuItem>
	);
}
