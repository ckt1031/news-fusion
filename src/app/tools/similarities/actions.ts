'use server';

import { nextServerEnv } from '@/app/utils/env/server';
import { authActionClient } from '@/app/utils/safe-action';
import { getContentMarkdownParallel } from '@/lib/get-urls';
import { requestEmbeddingsAPI } from '@/lib/llm/api';
import { isArticleSimilar } from '@/lib/news/similarity';
import { similaritySchema } from './schema';

export const findSimilaritiesAction = authActionClient
	.schema(similaritySchema)
	.action(async ({ parsedInput: formData }) => {
		const url = formData.url;
		let embedding: number[] | undefined | null = null;

		if (url) {
			const fetchedContent = (
				await getContentMarkdownParallel(nextServerEnv, [url])
			)[0];

			if (!fetchedContent || fetchedContent.content.length === 0) {
				throw new Error(`Failed to fetch content for ${url}`);
			}

			embedding = await requestEmbeddingsAPI({
				env: nextServerEnv,
				text: fetchedContent.content,
			});
		}

		if (formData.content) {
			embedding = await requestEmbeddingsAPI({
				env: nextServerEnv,
				text: formData.content,
			});
		}

		if (!embedding) {
			throw new Error('No content to compare');
		}

		const similar = await isArticleSimilar(
			embedding,
			formData.noSameDomain ? undefined : url,
		);

		return similar;
	});
