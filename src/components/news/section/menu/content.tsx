import { useAuthStore } from '@/components/store/auth';
import {
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import AuthenticatedMenuContent from './content-authenticated';
import CopyButton from './copy-to-clipboard';

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
			{isLoggedIn && <AuthenticatedMenuContent guid={guid} />}
		</>
	);
}
