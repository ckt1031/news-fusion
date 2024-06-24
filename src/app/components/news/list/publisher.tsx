import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/app/components/ui/avatar';
import { cn } from '@/app/utils/cn';
import { FAVICON_BASE_URL } from '@/config/api';

interface PublisherComponentProps {
	url: string;
	publisher: string;
	className?: string;
}

export default function PublisherComponent({
	publisher,
	className,
	url,
}: PublisherComponentProps) {
	return (
		<div className={cn(className)}>
			<div className="flex flex-row items-center">
				<Avatar className="h-4 w-4 mr-1">
					<AvatarImage src={`${FAVICON_BASE_URL}${url}`} alt="Profile" />
					<AvatarFallback>{publisher.charAt(0).toUpperCase()}</AvatarFallback>
				</Avatar>
				<span>{publisher}</span>
			</div>
		</div>
	);
}
