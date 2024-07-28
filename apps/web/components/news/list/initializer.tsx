'use client';

import { type NewsStore, useNewsStore } from '@/components/store/news';
import { type PropsWithChildren, useEffect } from 'react';

interface Props {
	news: NewsStore['news'];
	pageData?: NewsStore['pageData'];
	type: NewsStore['type'];

	// Custom features
	disableBookmark?: boolean;
	disableRegenerate?: boolean;
}

export default function AppInitializer({
	pageData,
	news,
	children,
	type,
	...props
}: PropsWithChildren<Props>) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		useNewsStore.setState({
			news,
			displayingNews: news,
			pageData,
			type,
			loading: false,
			...props,
		});
	}, [news, pageData, type]);

	return children;
}
