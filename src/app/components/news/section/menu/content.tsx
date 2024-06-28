import {
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import { useAuthStore } from '@/app/store/auth';
import BookmarkButton from './bookmark';
import CopyButton from './copy-to-clipboard';
import { SummarizeButton } from './generate';
import { TranslateButton } from './translate';

interface Props {
	guid: string;
}

export default function NewsSectionDropdownMenuContent({ guid }: Props) {
	const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

	return (
		<>
			<DropdownMenuLabel>Operations</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<CopyButton guid={guid} />
			{isLoggedIn && (
				<>
					<TranslateButton guid={guid} />
					<BookmarkButton guid={guid} />
					<SummarizeButton />
				</>
			)}
		</>
	);
}
