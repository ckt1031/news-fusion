import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonNewsList() {
	const numbers = [1, 2, 3, 4];

	return (
		<div className="flex flex-col gap-3 mt-3">
			{numbers.map((n) => (
				<Skeleton key={n} className="h-[65px]" />
			))}
		</div>
	);
}

export function SkeletonSingleNews() {
	return <Skeleton className="h-[65px]" />;
}
