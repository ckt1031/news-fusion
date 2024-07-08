'use client';

import type { PropsWithChildren } from 'react';
import type { ArticleFetchingReturnProps } from './schema';
import { useUIStore } from './store';

interface Props {
	data: NonNullable<ArticleFetchingReturnProps>;
}

export default function StateInitializer({
	children,
	data,
}: PropsWithChildren<Props>) {
	useUIStore.setState({ data });

	return children;
}
