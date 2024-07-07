'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggleMenuItem() {
	const { setTheme } = useTheme();

	return (
		<DropdownMenuSub>
			<DropdownMenuLabel>Theme</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuSubTrigger>
				<Sun className="mr-2 h-4 w-4 scale-100 transition-all dark:scale-0" />
				<Moon className="mr-2 h-4 w-4 absolute scale-0 transition-all dark:scale-100" />
				<span>Toggle theme</span>
			</DropdownMenuSubTrigger>
			<DropdownMenuPortal>
				<DropdownMenuSubContent>
					<DropdownMenuItem onClick={() => setTheme('light')}>
						Light
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('dark')}>
						Dark
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('system')}>
						System
					</DropdownMenuItem>
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	);
}
