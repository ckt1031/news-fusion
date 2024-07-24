import { DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { RotateCw } from 'lucide-react';
import { useUIStore } from '../store';

export default function RegenerateButton() {
	const setDialog = useUIStore((state) => state.setDialog);

	const openDialog = () => {
		setDialog('regenerate');
	};

	return (
		<DialogTrigger asChild>
			<DropdownMenuItem onClick={openDialog}>
				<RotateCw className="h-4 w-4 mr-2" />
				Re-Generate Content
			</DropdownMenuItem>
		</DialogTrigger>
	);
}
