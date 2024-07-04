import { Button } from '@/app/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/app/components/ui/card';
import { BookMarked, Share2 } from 'lucide-react';
import Link from 'next/link';

function Navigations() {
	return (
		<div className="flex flex-row flex-wrap gap-2">
			<Link href="/share">
				<Button variant="outline">
					<Share2 className="w-4 h-4 mr-2" />
					<p>Summarized Articles</p>
				</Button>
			</Link>
			<Link href="/bookmarks">
				<Button variant="outline">
					<BookMarked className="w-4 h-4 mr-2" />
					<p>Bookmarked Articles</p>
				</Button>
			</Link>
		</div>
	);
}

export default function ProfileNavigation() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Navigations</CardTitle>
				<CardDescription>
					Navigate and view your own data and records
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Navigations />
			</CardContent>
		</Card>
	);
}
