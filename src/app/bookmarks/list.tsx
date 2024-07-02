'use client';

import Content from '../components/news/list/content';
import AppInitializer from '../components/news/list/initializer';
import { NewsType } from '../store/news';
import type { Bookmarks } from './actions';

interface Props {
	bookmarks: Bookmarks;
}

export default function BookmarkList({ bookmarks }: Props) {
	return (
		<div className="flex flex-col mt-2">
			<h1 className="text-2xl font-bold">All Bookmarks</h1>
			<AppInitializer news={bookmarks} type={NewsType.Bookmarks}>
				<Content />
			</AppInitializer>
		</div>
	);
}
