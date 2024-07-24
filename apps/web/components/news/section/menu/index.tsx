import LoadingComponent from '@/components/loading';
import { Dialog } from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ellipsis } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useUIStore } from './store';

const NewsSectionDropdownMenuContent = dynamic(() => import('./content'), {
	loading: () => <LoadingComponent />,
});
const TranslateDialog = dynamic(() => import('./translate/dialog'));
const RegenerateDialog = dynamic(() => import('./re-generate/dialog'));

interface Props {
	guid: string;
}

export default function NewsSectionDropdownMenu({ guid }: Props) {
	const dialog = useUIStore((state) => state.dialog);

	return (
		<Dialog>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Ellipsis className="w-4 h-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<NewsSectionDropdownMenuContent guid={guid} />
				</DropdownMenuContent>
			</DropdownMenu>
			{dialog === 'translate' && <TranslateDialog guid={guid} />}
			{dialog === 'regenerate' && <RegenerateDialog guid={guid} />}
		</Dialog>
	);
}
