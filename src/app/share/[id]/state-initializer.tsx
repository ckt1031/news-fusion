'use client';

import type { PropsWithChildren } from 'react';
import type { SharedArticleFetchingReturnProps } from './schema';
import { useUIStore } from './store';

interface Props {
	data: NonNullable<SharedArticleFetchingReturnProps>;
}

export default function StateInitializer({
	children,
	data,
}: PropsWithChildren<Props>) {
	useUIStore.setState({ data });

	return children;
}
