import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/app/components/ui/popover';
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import LoadingComponent from '../../loading';

const NewsSearchingPopoverContent = dynamic(() => import('./popover'), {
	loading: () => <LoadingComponent />,
});

export default function NewsSearching() {
	return (
		<Popover>
			<PopoverTrigger>
				<Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
			</PopoverTrigger>
			<PopoverContent align="center">
				<NewsSearchingPopoverContent />
			</PopoverContent>
		</Popover>
	);
}
