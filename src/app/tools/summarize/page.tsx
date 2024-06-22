import Component from './content';

export const runtime = 'edge';

export default function SummarizePage() {
	return (
		<div className="mt-3">
			<h1 className="text-3xl font-bold text-center">Summarize Web</h1>
			<Component />
		</div>
	);
}
