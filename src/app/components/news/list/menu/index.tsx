import LoadingComponent from '@/app/components/loading';
import { AlertDialog } from '@/app/components/ui/alert-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { CircleEllipsis } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ClearCacheDialog } from './clear-cache';
import { useUIStore } from './store';

const MenuContent = dynamic(() => import('./content'), {
	loading: () => <LoadingComponent />,
});

export default function NewsPageDropdownMenu() {
	const dialog = useUIStore((state) => state.dialog);

	return (
		<AlertDialog>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<CircleEllipsis className="w-4 h-4 text-gray-500 dark:text-gray-400" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<MenuContent />
				</DropdownMenuContent>
			</DropdownMenu>
			{dialog === 'clear-cache' && <ClearCacheDialog />}
		</AlertDialog>
	);
}
