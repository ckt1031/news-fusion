import { useNewsStore } from '@/components/store/news';
import { DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Languages, Undo2 } from 'lucide-react';
import { useUIStore } from '../store';

interface Props {
	guid: string;
}

export default function TranslateButton({ guid }: Props) {
	const setDialog = useUIStore((state) => state.setDialog);

	const openDialog = () => {
		setDialog('translate');
	};

	const baseItem = useNewsStore((state) => state.getItem(guid));

	const setShowingItem = useNewsStore((state) => state.setShowingItem);

	const revertTranslation = async () => {
		// Revert the translation
		setShowingItem(guid, {
			title: baseItem.title,
			summary: baseItem.summary,
			immersiveTranslate: false,
		});
	};

	const translated = useNewsStore((state) => state.isItemTranslated(guid));

	return translated ? (
		<DropdownMenuItem onClick={revertTranslation}>
			<Undo2 className="h-4 w-4 mr-2" />
			Revert Translation
		</DropdownMenuItem>
	) : (
		<DialogTrigger asChild>
			<DropdownMenuItem onClick={openDialog}>
				<Languages className="h-4 w-4 mr-2" />
				Translate
			</DropdownMenuItem>
		</DialogTrigger>
	);
}
