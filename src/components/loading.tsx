import { Loader2 } from 'lucide-react';

export default function LoadingComponent() {
	return (
		<div className="flex flex-row items-center w-full py-3 justify-center">
			<Loader2 className="mr-2 h-4 w-4 animate-spin" />
			<p>Loading...</p>
		</div>
	);
}
