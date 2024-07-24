import BookmarkButton from './bookmark';
import RegenerateButton from './re-generate/trigger';
import TranslateButton from './translate/trigger';

interface Props {
	guid: string;
}

export default function AuthenticatedMenuContent({ guid }: Props) {
	return (
		<>
			<TranslateButton guid={guid} />
			<BookmarkButton guid={guid} />
			<RegenerateButton />
		</>
	);
}
