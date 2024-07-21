import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

interface Props {
	className?: string;
}

export default function SkeletonCard({ className }: Props) {
	return <Skeleton className={cn('h-20', className)} />;
}
