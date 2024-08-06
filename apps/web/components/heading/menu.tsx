'use client';

import { EllipsisVertical } from 'lucide-react';

import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dynamic from 'next/dynamic';
import LoadingComponent from '../loading';
import { LogOutDialog } from './logout';

const MenuContent = dynamic(() => import('./menu-content'), {
	ssr: false,
	loading: () => <LoadingComponent />,
});

export default function HeaderMenu() {
	return (
		<AlertDialog>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<EllipsisVertical className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-[170px] lg:w-[200px]">
					<MenuContent />
				</DropdownMenuContent>
			</DropdownMenu>
			<LogOutDialog />
		</AlertDialog>
	);
}
