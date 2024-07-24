import type { Metadata } from 'next';
import CheckImportancePageContentComponent from './content';

const title = 'Tool: Check News Importance';

export const metadata: Metadata = {
	title,
	openGraph: {
		title,
	},
	twitter: {
		title,
	},
};

export default function SimilaritiesPage() {
	return (
		<div className="mt-3">
			<h1 className="text-3xl font-bold text-center">Check News Importance</h1>
			<CheckImportancePageContentComponent />
		</div>
	);
}
