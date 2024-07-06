import {
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import { useAuthStore } from '@/app/store/auth';
import dynamic from 'next/dynamic';
import CopyButton from './copy-to-clipboard';

const AuthenticatedMenuContent = dynamic(
	() => import('./content-authenticated'),
	{ loading: () => null },
);

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
