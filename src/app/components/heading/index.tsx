import { DEFAULT_SITE_TITLE } from '@/config';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';

const HeaderMenu = dynamic(() => import('./menu'), {
	ssr: false,
	loading: () => (
		<Skeleton className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
	),
});

export default function Heading() {
	return (
		<header className="flex flex-row py-2 mt-1 md:mt-3 justify-between items-center root-container">
			<div className="">
				<a className="text-3xl font-semibold dark:text-white" href="/">
					{DEFAULT_SITE_TITLE}
				</a>
				<p className="text-gray-600 dark:text-gray-400">
					Hassle-free news reading experience
				</p>
			</div>
			<div>
				<HeaderMenu />
			</div>
		</header>
	);
}
