import { summarizeLongTextPromptWithInstruction } from '@ckt1031/prompts';
import { getContentMarkdownFromURL } from '@ckt1031/tool-api';
import type { ServerEnv } from '@ckt1031/types';
import Mustache from 'mustache';

export async function getContentMarkdownParallel(
	env: ServerEnv,
	urls: string[],
) {
	const fetchedContent: {
		url: string;
		content: string;
	}[] = [];

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

	const userPrompt = Mustache.render(summarizeLongTextPromptWithInstruction, {
		instructions: content,
		extraContent,
		webQueries,
	});

	return userPrompt;
}
