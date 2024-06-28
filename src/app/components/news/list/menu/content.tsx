import {
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import { ClearCacheButton } from './clear-cache';

export default function MenuContent() {
	return (
		<>
			<DropdownMenuLabel>Administration</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<ClearCacheButton />
		</>
	);
}
