import LoadingComponent from '@/components/loading';
import { AlertDialog } from '@/components/ui/alert-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CircleEllipsis } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useUIStore } from './store';

const MenuContent = dynamic(() => import('./content'), {
	ssr: false,
	loading: () => <LoadingComponent />,
});
const ClearCacheDialog = dynamic(() =>
	import('./clear-cache').then((d) => d.ClearCacheDialog),
);

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
