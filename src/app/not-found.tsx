import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { CircleHelp } from 'lucide-react';
import type { Metadata } from 'next';

const title = '404 Not Found';

export const metadata: Metadata = {
	title,
	openGraph: {
		title,
	},
};

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
