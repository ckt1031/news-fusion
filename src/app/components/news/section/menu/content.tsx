import {
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import { useAuthStore } from '@/app/store/auth';
import BookmarkButton from './bookmark';
import CopyButton from './copy-to-clipboard';
import { RegenerateButton } from './re-generate';
import { ShareButton } from './share';
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
					<RegenerateButton />
					<ShareButton />
				</>
			)}
		</>
	);
}
