import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import { useToast } from '@/app/components/ui/use-toast';
import { useNewsStore } from '@/app/store/news';
import { Clipboard } from 'lucide-react';

interface Props {
	guid: string;
}

export default function CopyButton({ guid }: Props) {
	const { toast } = useToast();

	const baseItem = useNewsStore((state) => state.getItem(guid));

	const onCopy = async () => {
		// Copy to clipboard
		navigator.clipboard.writeText(baseItem.url);

		toast({
			description: 'Copied to clipboard',
		});
	};

	return (
		<DropdownMenuItem onClick={onCopy}>
			<Clipboard className="h-4 w-4 mr-2" />
			Copy URL
		</DropdownMenuItem>
	);
}
