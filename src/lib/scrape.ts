import type { ServerEnv } from '@/types/env';
import { ofetch } from 'ofetch';

export type ScrapeMarkdownVar = Pick<
	ServerEnv,
	'TOOLS_API_BASE_URL' | 'TOOLS_API_KEY'
>;

/** Get website major content in markdown format from personal API */
export async function scrapeToMarkdown(env: ScrapeMarkdownVar, url: string) {
	console.log('Scraping markdown from:', url);

	type ExtractAPIResponse = {
		content: string;
	};

	const extractAPIResponse = await ofetch<ExtractAPIResponse>(
		`${env.TOOLS_API_BASE_URL}/v1/web/extract/markdown?url=${url}`,
		{
			headers: {
				accept: 'application/json',
				Authorization: `Bearer ${env.TOOLS_API_KEY}`,
			},
			timeout: 10000,	
		},
	);

	return extractAPIResponse.content;
}
