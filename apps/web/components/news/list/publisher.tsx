import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/utils/cn';
import { FAVICON_BASE_URL } from '@ckt1031/config';
import queryString from 'query-string';

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
	const qs = queryString.stringify({ domain_url: url, sz: 128 });
	const faviconURL = `${FAVICON_BASE_URL}?${qs}`;

	return (
		<div className={cn(className)}>
			<div className="flex flex-row items-center">
				<Avatar className="h-4 w-4 mr-1">
					<AvatarImage src={faviconURL} alt="Profile" />
					<AvatarFallback>{publisher.charAt(0).toUpperCase()}</AvatarFallback>
				</Avatar>
				<span>{publisher}</span>
			</div>
		</div>
	);
}
