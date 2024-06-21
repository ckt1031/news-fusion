import SimilaritiesPageContentComponent from './content';

export const runtime = 'nodejs';

export default function SimilaritiesPage() {
	return (
		<div className="mt-3">
			<h1 className="text-3xl font-bold text-center">Find out similarities</h1>
			<SimilaritiesPageContentComponent />
		</div>
	);
}
