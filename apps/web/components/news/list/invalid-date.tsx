import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

export default function NewsInvalidDate() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex flex-row gap-2">
					<ShieldX className="w-6 h-6" />
					Invalid Date
				</CardTitle>
				<CardDescription>
					You can only view news from the past 30 days
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
