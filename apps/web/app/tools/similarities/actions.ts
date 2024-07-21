'use server';

import { nextServerEnv } from '@/utils/env/server';
import { getContentMarkdownParallel } from '@/utils/get-urls';
import { authActionClient } from '@/utils/safe-action';
import { requestEmbeddingsAPI } from '@ckt1031/ai';
import { isArticleSimilar } from '@ckt1031/news';
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
