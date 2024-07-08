import { useNewsStore } from '@/components/store/news';

interface NewsSimilaritiesProps {
	guid: string;
}

export default function NewsSimilarities({ guid }: NewsSimilaritiesProps) {
	const baseItem = useNewsStore((state) => state.getItem(guid));
	const similarities = baseItem.similarArticles;

	if (similarities.length === 0) {
		return null;
	}

	return (
		<div className="my-3 dark:bg-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
			<h4>Similar Articles</h4>
			<ul className="list-disc px-5 mt-2 truncate">
				{similarities.map((similarity) => (
					<li key={similarity}>
						<a
							href={similarity}
							target="_blank"
							rel="noopener noreferrer"
							className="underline"
						>
							{similarity}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
