'use server';

import { authActionClient } from '@/app/utils/safe-action';
import { DEFAULT_SUMMARIZE_MODEL } from '@/config/api';
import {
	contentToSummarizePromptTemplate,
	getContentMarkdownParallel,
	getUrlFromText,
} from '@/lib/get-urls';
import { getOpenAI } from '@/lib/llm/api';
import { generateSearchQuery } from '@/lib/llm/prompt-calls';
import { webSearch } from '@/lib/tool-apis';
import summarizePrompt from '@/prompts/summarize';
import type { ServerEnv } from '@/types/env';
import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { summarizeSchema } from './schema';

export const summarizeDetailAction = authActionClient
	.schema(summarizeSchema)
	.action(async ({ parsedInput: formData }) => {
		const searchLimit = 5;

		const env = process.env as unknown as ServerEnv;

		const urls = getUrlFromText(formData.content);

		let query = '';

		async function webQuery() {
			query = await generateSearchQuery(env, formData.content);
			const queryResults = await webSearch(env, query, searchLimit);

			// Remove all existing URLs from the search results
			const filteredResults = urls
				? queryResults.filter((result) => !urls.includes(result.link))
				: queryResults;

			return await getContentMarkdownParallel(
				env,
				filteredResults.map((result) => result.link),
			);
		}

		const fetchedContent = await Promise.all([
			...(formData.webSearch ? [webQuery()] : []),
			...(urls ? [getContentMarkdownParallel(env, urls)] : []),
		]);

		const userPrompt = contentToSummarizePromptTemplate({
			fetchedContent: fetchedContent.flat(),
			content: formData.content,
		});

		const openai = getOpenAI(env);

		const result = await streamText({
			model: openai(env.DEFAULT_SUMMARIZE_MODEL ?? DEFAULT_SUMMARIZE_MODEL),
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
