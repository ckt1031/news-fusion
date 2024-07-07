import { cn } from '@/app/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
	className?: string;
}

export default function SkeletonCard({ className }: Props) {
	return <Skeleton className={cn('h-20', className)} />;
}
