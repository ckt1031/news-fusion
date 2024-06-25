import { useNewsStore } from '@/app/store/news';
import { AddArticleUserRelationStatus } from '@/lib/db';
import { BookmarkPlus } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { Button } from '../../ui/button';
import { useToast } from '../../ui/use-toast';
import { addBookmarkAction } from '../actions/bookmark';

interface Props {
	guid: string;
}

export default function Bookmark({ guid }: Props) {
	const { toast } = useToast();
	const { executeAsync, isExecuting } = useAction(addBookmarkAction);

	const baseItem = useNewsStore((state) => state.getItem(guid));

	const onAdd = async () => {
		const status = await executeAsync({
			articleId: baseItem.id,
		});

		if (status?.data?.status === AddArticleUserRelationStatus.AlreadyExists) {
			toast({
				description: 'Bookmark already exists',
			});
		} else if (status?.data?.status !== AddArticleUserRelationStatus.Success) {
			toast({
				description: 'Bookmark added',
			});
		}
	};

	return (
		<Button
			variant="ghost"
			type="button"
			onClick={onAdd}
			disabled={isExecuting}
		>
			<BookmarkPlus className="h-4 w-4" />
			<span className="ml-2 hidden lg:block">Bookmark</span>
		</Button>
	);
}
