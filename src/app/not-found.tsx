import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/app/components/ui/card';
import { CircleHelp } from 'lucide-react';

export default function NotFoundPage() {
	return (
		<Card className="my-3">
			<CardHeader>
				<CardTitle className="flex flex-row gap-2">
					<CircleHelp className="w-6 h-6" />
					404 Not Found
				</CardTitle>
				<CardDescription>
					The page you're looking for doesn't exist.
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
