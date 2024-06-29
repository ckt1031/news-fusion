import type { ServerEnv } from '@/types/env';
import type { paths } from '@/types/tool-apis';
import createClient from 'openapi-fetch';
import logging from './console';

export type ScrapeMarkdownVar = Pick<
	ServerEnv,
	'TOOLS_API_BASE_URL' | 'TOOLS_API_KEY'
>;

function getClient(env: ScrapeMarkdownVar) {
	const client = createClient<paths>({
		baseUrl: env.TOOLS_API_BASE_URL,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.TOOLS_API_KEY}`,
		},
	});

	return client;
}

export async function getContentMarkdownFromURL(
	env: ScrapeMarkdownVar,
	url: string,
) {
	const host = new URL(url).host;
	let content = '';

	if (host.includes('youtube.com')) {
		const ytInfo = await scrapeYouTube(env, url);
		content = ytInfo.captions?.text ?? '';
	} else {
		content = await scrapeToMarkdown(env, url);
	}

	return content;
}

/** Get website major content in markdown format from personal API */
export async function scrapeToMarkdown(env: ScrapeMarkdownVar, url: string) {
	logging.info('Scraping markdown from:', url);

	const client = getClient(env);

	const { data, error } = await client.GET('/v1/web/extract/markdown', {
		params: {
			query: { url },
		},
	});

	if (error || !data) {
		throw new Error(`Failed to scrape markdown from ${url}`);
	}

	return data.content;
}

export async function scrapeMetaData(env: ScrapeMarkdownVar, url: string) {
	logging.info('Scraping metadata from:', url);

	const client = getClient(env);

	const { data, error } = await client.GET('/v1/web/extract/meta', {
		params: {
			query: { url },
		},
	});

	if (error || !data) {
		throw new Error(`Failed to scrape metadata from ${url}`);
	}

	return data;
}

export async function scrapeYouTube(env: ScrapeMarkdownVar, url: string) {
	logging.info('Scraping YouTube:', url);

	const client = getClient(env);

	const { data, error } = await client.GET('/v1/web/youtube', {
		params: {
			query: { url },
		},
	});

	if (error || !data) {
		throw new Error(`Failed to scrape YouTube from ${url}`);
	}

	return data;
}

export async function webSearch(env: ServerEnv, query: string, limit = 5) {
	logging.info('Searching the web:', query);

	const client = getClient(env);

	const { data, error } = await client.GET('/v1/web/search', {
		params: {
			query: { query, limit: limit.toString() },
		},
	});

	if (error || !data) {
		throw new Error(`Failed to search the web for ${query}`);
	}

	return data.data.slice(0, limit);
}

export async function googleTranslate(
	env: ServerEnv,
	text: string,
	targetLanguage: string,
) {
	logging.info('Translating:', text);

	const client = getClient(env);

	const { data, error } = await client.POST('/v1/translate/google', {
		body: { text, to: targetLanguage },
	});

	console.log(error);

	if (error || !data) {
		throw new Error(`Failed to translate ${text}`);
	}

	return data;
}
