'use client';

import LoadingComponent from '@/components/loading';
import SkeletonSmallButtonIcon from '@/components/skeleton/button';
import { useAuthStore } from '@/components/store/auth';
import { useNewsStore } from '@/components/store/news';
import dynamic from 'next/dynamic';
import Items from './items';

const NewsSearching = dynamic(() => import('../searching'), {
	ssr: false,
	loading: () => <SkeletonSmallButtonIcon />,
});
const NewsPageDropdownMenu = dynamic(() => import('./menu'), {
	ssr: false,
	loading: () => <SkeletonSmallButtonIcon />,
});

export default function Content() {
	const { type, displayingNews, loading } = useNewsStore((state) => state);
	const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

	if (loading) {
		return <LoadingComponent />;
	}

	return (
		<>
			<div className="flex flex-row items-center mb-1 gap-2 py-2">
				<p className="text-gray-500 dark:text-gray-400 text-sm">
					{displayingNews.length} {type} found
				</p>
				<NewsSearching />
				{isLoggedIn && <NewsPageDropdownMenu />}
			</div>
			<Items />
		</>
	);
}
