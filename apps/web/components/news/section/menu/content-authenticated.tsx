import { useNewsStore } from '@/components/store/news';
import BookmarkButton from './bookmark';
import RegenerateButton from './re-generate/trigger';
import TranslateButton from './translate/trigger';

interface Props {
	guid: string;
}

export default function AuthenticatedMenuContent({ guid }: Props) {
	const disableBookmark = useNewsStore((state) => state.disableBookmark);
	const disableRegenerate = useNewsStore((state) => state.disableRegenerate);

	return (
		<>
			<TranslateButton guid={guid} />
			{!disableBookmark && <BookmarkButton guid={guid} />}
			{!disableRegenerate && <RegenerateButton />}
		</>
	);
}
