'use client';

import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import { createSupabaseBrowserClient } from '@/app/utils/supabase/client';
import { LogOut } from 'lucide-react';

export default function LogOutMenuItem() {
	const client = createSupabaseBrowserClient();
	return (
		<DropdownMenuItem
			onClick={async () => {
				await client.auth.signOut();
			}}
		>
			<LogOut className="mr-2 h-4 w-4" />
			<span>Log Out</span>
		</DropdownMenuItem>
	);
}
