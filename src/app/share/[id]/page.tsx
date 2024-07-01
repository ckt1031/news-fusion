import { getSharedArticle } from '@/lib/db';
import { notFound } from 'next/navigation';
import SharedArticleComponent from './component';
import StateInitializer from './state-initializer';

interface PageProps {
	params: { id: string };
}

export const runtime = 'edge';

export default async function SharePage({ params }: PageProps) {
	const id = params.id;
	const shared = await getSharedArticle(id);

	if (!shared) return notFound();

	return (
		<StateInitializer data={shared}>
			<SharedArticleComponent />
		</StateInitializer>
	);
}
