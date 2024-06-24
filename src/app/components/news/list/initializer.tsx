'use client';

import { type NewsStore, useNewsStore } from '@/app/store/news';
import type { PropsWithChildren } from 'react';

interface Props {
	news: NewsStore['news'];
	pageData: NewsStore['pageData'];
}

export default function AppInitializer({
	pageData,
	news,
	children,
}: PropsWithChildren<Props>) {
	useNewsStore.setState({
		news,
		displayingNews: news,
		pageData,
	});

	return children;
}
