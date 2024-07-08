'use client';

import { type NewsStore, useNewsStore } from '@/components/store/news/items';
import { type PropsWithChildren, useEffect } from 'react';

interface Props {
	news: NewsStore['news'];
	pageData?: NewsStore['pageData'];
	type: NewsStore['type'];
}

export default function AppInitializer({
	pageData,
	news,
	children,
	type,
}: PropsWithChildren<Props>) {
	useEffect(() => {
		useNewsStore.setState({
			news,
			displayingNews: news,
			pageData,
			type,
			loading: false,
		});
	}, [news, pageData, type]);

	return children;
}
