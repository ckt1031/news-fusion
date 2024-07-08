import BookmarkButton from './bookmark';
import { RegenerateButton } from './re-generate';
//import { ShareButton } from './share';
import { TranslateButton } from './translate';

interface Props {
	guid: string;
}

export default function AuthenticatedMenuContent({ guid }: Props) {
	return (
		<>
			<TranslateButton guid={guid} />
			<BookmarkButton guid={guid} />
			<RegenerateButton />
			{/* <ShareButton /> */}
		</>
	);
}
