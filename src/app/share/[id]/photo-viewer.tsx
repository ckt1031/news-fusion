import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider, PhotoView } from 'react-photo-view';

interface PhotoProviderProps {
	src: string;
	alt?: string;
}

export default function ThumbnailPhotoViewer({ src, alt }: PhotoProviderProps) {
	return (
		<PhotoProvider>
			<PhotoView src={src}>
				<img
					src={src}
					alt={alt}
					className="rounded-lg max-w-3xl cursor-zoom-in my-2 w-full"
				/>
			</PhotoView>
		</PhotoProvider>
	);
}
