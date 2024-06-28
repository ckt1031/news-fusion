'use client';

import type { Article } from '@/db/schema';
import Content from '../components/news/list/content';
import AppInitializer from '../components/news/list/initializer';

interface Props {
	articles: Article[];
}

export default function BookmarkList({ articles }: Props) {
	return (
		<div className="flex flex-col mt-2">
			<h1 className="text-2xl font-bold">All Bookmarks</h1>
			<AppInitializer news={articles} type="bookmarks">
				<Content />
			</AppInitializer>
		</div>
	);
}
