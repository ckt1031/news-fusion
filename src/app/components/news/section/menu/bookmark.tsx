import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import { useToast } from '@/app/components/ui/use-toast';
import { useNewsStore } from '@/app/store/news';
import { BookmarkPlus } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import {
	addBookmarkAction,
	removeBookmarkAction,
} from '../../actions/bookmark';

interface Props {
	guid: string;
}

export default function BookmarkButton({ guid }: Props) {
	const { toast } = useToast();

	const type = useNewsStore((state) => state.type);

	const { executeAsync: addBookmark, isExecuting: isAddingBookmark } =
		useAction(addBookmarkAction);

	const { executeAsync: removeBookmark, isExecuting: isRemovingBookmark } =
		useAction(removeBookmarkAction);

	const baseItem = useNewsStore((state) => state.getItem(guid));

	const onAdd = async () => {
		toast({
			description: `Adding ${baseItem.title} to bookmarks...`,
		});

		const status = await addBookmark({
			articleId: baseItem.id,
		});

		if (status?.data?.status === 1) {
			toast({
				description: 'Bookmark already exists',
			});
		} else if (status?.data?.status === 2) {
			toast({
				description: 'Bookmark added',
			});
		}
	};

	const onDelete = async () => {
		const status = await removeBookmark({
			articleId: baseItem.id,
		});

		if (status?.data?.success) {
			toast({
				description: 'Bookmark removed',
			});
		}
	};

	return (
		<DropdownMenuItem
			onClick={type === 'bookmarks' ? onDelete : onAdd}
			disabled={isAddingBookmark || isRemovingBookmark}
		>
			<BookmarkPlus className="h-4 w-4 mr-2" />
			{type === 'bookmarks' ? 'Remove' : 'Add'} Bookmark
		</DropdownMenuItem>
	);
}
