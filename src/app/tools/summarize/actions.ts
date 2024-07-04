'use server';

import { nextServerEnv } from '@/app/utils/env/server';
import { authActionClient } from '@/app/utils/safe-action';
import { DEFAULT_SUMMARIZE_MODEL } from '@/config/api';
import {
	contentToSummarizePromptTemplate,
	getContentMarkdownParallel,
	getUrlFromText,
} from '@/lib/get-urls';
import { getOpenAI } from '@/lib/llm/api';
import { requestRerankerAPI } from '@/lib/llm/api';
import { generateSearchQuery } from '@/lib/llm/prompt-calls';
import { webSearch } from '@/lib/tool-apis';
import summarizePrompt from '@/prompts/summarize';
import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { SummarizeSchema } from './schema';

export const summarizeDetailAction = authActionClient
	.schema(SummarizeSchema)
	.action(async ({ parsedInput: formData }) => {
		const searchLimit = 5;

		const urls = getUrlFromText(formData.content);

		let query = '';

		async function webQuery() {
			query = await generateSearchQuery(nextServerEnv, formData.content);
			const queryResults = await webSearch(nextServerEnv, query, searchLimit);

			// documents is string[]
			const documents = queryResults.map(
				(result) => `${result.title}\n${result.snippet}`,
			);

			const rerankResponse = await requestRerankerAPI({
				env: nextServerEnv,
				documents,
				text: query,
			});

			const allSelectedIndexes = rerankResponse.map((result) => result.index);

			const selectedResults = queryResults.filter((_, index) =>
				allSelectedIndexes.includes(index),
			);

			// Remove all existing URLs from the search results
			const filteredResults = urls
				? selectedResults.filter((result) => !urls.includes(result.link))
				: selectedResults;

			return await getContentMarkdownParallel(
				nextServerEnv,
				filteredResults.map((result) => result.link),
			);
		}

		const fetchedContent = await Promise.all([
			...(formData.webSearch ? [webQuery()] : []),
			...(urls ? [getContentMarkdownParallel(nextServerEnv, urls)] : []),
		]);

		const userPrompt = contentToSummarizePromptTemplate({
			fetchedContent: fetchedContent.flat(),
			content: formData.content,
		});

		const openai = getOpenAI(nextServerEnv);

		const result = await streamText({
			model: openai(
				nextServerEnv.DEFAULT_SUMMARIZE_MODEL ?? DEFAULT_SUMMARIZE_MODEL,
			),
			system: summarizePrompt,
			prompt: userPrompt,
		});

		const stream = createStreamableValue(result.textStream);

		const searchResults = {
			query,
			urls: fetchedContent.flat().map((content) => content.url),
		};

		return { LLM: stream.value, searchResults };
	});
