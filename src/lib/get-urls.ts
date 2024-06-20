import { instructionIncludedPrompt } from '@/prompts/summarize';
import type { ServerEnv } from '@/types/env';
import Mustache from 'mustache';
import { getContentMarkdownFromURL } from './tool-apis';

export function getUrlFromText(text: string) {
	const urlPattern = /(https?:\/\/[^\s)]+)/g;

	return text.match(urlPattern);
}

export async function getContentMarkdownParallel(
	env: ServerEnv,
	urls: string[],
) {
	const fetchedContent: {
		url: string;
		content: string;
	}[] = [];

	//getContentMakrdownFromURL
	// Use Promise.all to summarize multiple URLs
	const summaries = await Promise.all(
		urls.map((url) =>
			getContentMarkdownFromURL(env, url)
				.then((d) => ({
					url,
					content: d,
				}))
				.catch(() => ({
					url,
					content: '',
				})),
		),
	);

	fetchedContent.push(...summaries);

	return fetchedContent;
}

interface ContentToSummarizePromptTemplate {
	fetchedContent: Awaited<ReturnType<typeof getContentMarkdownParallel>>;
	content: string;
	webQueries?: string;
}

export function contentToSummarizePromptTemplate({
	fetchedContent,
	content,
	webQueries = '',
}: ContentToSummarizePromptTemplate) {
	const extraContent = fetchedContent
		.map(({ url, content }) => {
			return `## ${url}\n\n\`\`\`${content}\`\`\``;
		})
		.join('\n\n');

	const userPrompt = Mustache.render(instructionIncludedPrompt, {
		instructions: content,
		extraContent,
		webQueries,
	});

	return userPrompt;
}
