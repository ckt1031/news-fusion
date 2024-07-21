import type { Metadata } from 'next';
import Component from './content';

export const runtime = 'edge';

const title = 'Tool: Summarize';

export const metadata: Metadata = {
	title,
	openGraph: {
		title,
	},
	twitter: {
		title,
	},
};

export default function SummarizePage() {
	return (
		<div className="mt-3">
			<h1 className="text-3xl font-bold text-center">Summarize Web</h1>
			<Component />
		</div>
	);
}
