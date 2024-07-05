import 'react-photo-view/dist/react-photo-view.css';
import { cn } from '@/app/utils/cn';
import { PhotoProvider, PhotoView } from 'react-photo-view';

interface PhotoProviderProps {
	src: string;
	alt?: string;
	className?: string;
}

export default function ThumbnailPhotoViewer({
	src,
	alt,
	className,
}: PhotoProviderProps) {
	return (
		<PhotoProvider>
			<PhotoView src={src}>
				<img
					src={src}
					alt={alt}
					className={cn(className, 'rounded-lg max-w-3xl cursor-zoom-in my-2')}
				/>
			</PhotoView>
		</PhotoProvider>
	);
}
