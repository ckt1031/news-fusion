import { YouTubeEmbed } from '@next/third-parties/google';
import getYouTubeID from 'get-youtube-id';

interface Props {
	url: string;
}

export default function YouTubeEmbedComponent({ url }: Props) {
	const id = getYouTubeID(url);

	if (!id) return null;

	return (
		<div className="my-3 aspect-video max-h-40 md:max-h-60 lg:max-h-80">
			<YouTubeEmbed videoid={id} />
		</div>
	);
}
