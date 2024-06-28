import LoadingComponent from '@/app/components/loading';
import { Dialog } from '@/app/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Ellipsis } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SummarizeDialog } from './generate';
import { useNewsSectionUIStore } from './state';
import { TranslateDialog } from './translate';

const NewsSectionDropdownMenuContent = dynamic(() => import('./content'), {
	ssr: false,
	loading: () => <LoadingComponent />,
});

interface Props {
	guid: string;
}

export default function NewsSectionDropdownMenu({ guid }: Props) {
	const dialog = useNewsSectionUIStore((state) => state.dialog);

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
			{dialog === 'generate' && <SummarizeDialog guid={guid} />}
		</Dialog>
	);
}
