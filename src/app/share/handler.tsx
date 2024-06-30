'use client';

import { readStreamableValue } from 'ai/rsc';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { summarizeDetailAction } from '../tools/summarize/actions';
import SharedArticleComponent from './[id]/component';
import { useUIStore } from './[id]/store';
import { saveSharedArticleAction } from './action';

interface Props {
	articleId: number;
	useSearch: boolean;
	customInstructions: string;
}

export default function Handler({
	// guid,
	useSearch,
	customInstructions,
}: Props) {
	const router = useRouter();

	const [run, setRun] = useState(false);

	const { executeAsync: summarize } = useAction(summarizeDetailAction);
	const { executeAsync: saveDB } = useAction(saveSharedArticleAction);

	const data = useUIStore((state) => state.data);
	const setLongSummary = useUIStore((state) => state.setLongSummary);

	// useEffect(() => {
	// 	(async () => {
	// 		if (!data || isRunning) return;

	// 		setIsRunning(true);

	// 		const article = data.article;
	// 		if (!article) return;
	// 		const resp = await summarize({
	// 			content: `Summarize ${article.url} with detail and all important information. ${customInstructions}`,
	// 			webSearch: useSearch,
	// 		});

	// 		if (!resp?.data) return;

	// 		for await (const content of readStreamableValue(resp.data.LLM)) {
	// 			content && setLongSummary(content);
	// 		}
	// 		const dbResult = await saveDB({
	// 			articleId: article.id,
	// 			longSummary: data.longSummary,
	// 			sources: resp.data.searchResults.urls.filter(
	// 				(url: string) => url !== article.url,
	// 			),
	// 			// thumbnail: result.data.thumbnail
	// 		});
	// 		dbResult?.data?.id && router.push(`/share/${dbResult.data.id}`);
	// 		setIsRunning(false);

	// 	})();
	// }, []);

	const onRun = async () => {
		if (!data) return;

		setRun(true);

		const article = data.article;
		if (!article) return;
		const resp = await summarize({
			content: `Summarize ${article.url} with detail and all important information, clear markdown with minimum points (and subheadings if content has differrent aspects or number of theme).
      ${customInstructions}`,
			webSearch: useSearch,
		});

		if (!resp?.data) return;

		for await (const content of readStreamableValue(resp.data.LLM)) {
			content && setLongSummary(content);
		}

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const newData = useUIStore.getState().data!;
		const dbResult = await saveDB({
			articleId: article.id,
			longSummary: newData.longSummary,
			sources: resp.data.searchResults.urls.filter(
				(url: string) => url !== article.url,
			),
			// thumbnail: result.data.thumbnail
		});
		dbResult?.data?.id && router.push(`/share/${dbResult.data.id}`);
	};

	return (
		<>
			{run ? (
				<SharedArticleComponent />
			) : (
				<Button type="button" onClick={onRun}>
					Continue to generate?
				</Button>
			)}
		</>
	);
}
