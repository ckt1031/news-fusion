import LoadingComponent from '@/components/loading';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';

const NewsSearchingPopoverContent = dynamic(() => import('./popover'), {
	loading: () => <LoadingComponent />,
});

export default function NewsSearching() {
	return (
		<Popover>
			<PopoverTrigger>
				<Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
			</PopoverTrigger>
			<PopoverContent align="start" alignOffset={-50}>
				<NewsSearchingPopoverContent />
			</PopoverContent>
		</Popover>
	);
}
