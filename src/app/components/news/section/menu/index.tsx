import LoadingComponent from '@/app/components/loading';
import { Dialog } from '@/app/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Ellipsis } from 'lucide-react';
import dynamic from 'next/dynamic';
import { RegenerateDialog } from './re-generate';
import { useUIStore } from './store';
import { TranslateDialog } from './translate';

const NewsSectionDropdownMenuContent = dynamic(() => import('./content'), {
	ssr: false,
	loading: () => <LoadingComponent />,
});

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
