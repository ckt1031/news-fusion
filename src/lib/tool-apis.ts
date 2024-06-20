import type { ServerEnv } from '@/types/env';
import type { paths } from '@/types/tool-apis';
import translate from '@iamtraction/google-translate';
import consola from 'consola';
import createClient, { type Middleware } from 'openapi-fetch';
import { isMostlyChinese } from './detect-chinese';

export type ScrapeMarkdownVar = Pick<
	ServerEnv,
	'TOOLS_API_BASE_URL' | 'TOOLS_API_KEY'
>;

function getClient(env: ScrapeMarkdownVar) {
	const client = createClient<paths>({ baseUrl: env.TOOLS_API_BASE_URL });

	const authMiddleware: Middleware = {
		async onRequest({ request }) {
			// set "foo" header
			request.headers.set('Authorization', `Bearer ${env.TOOLS_API_KEY}`);
			return request;
		},
	};

	client.use(authMiddleware);

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

	// Save even more tokens
	if (content.length > 0 && isMostlyChinese(content)) {
		const { text } = await translate(content, { to: 'en' });
		content = text;
	}

	return content;
}

/** Get website major content in markdown format from personal API */
export async function scrapeToMarkdown(env: ScrapeMarkdownVar, url: string) {
	consola.start('Scraping markdown from:', url);

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
	consola.start('Scraping metadata from:', url);

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
	consola.start('Scraping YouTube:', url);

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
	consola.start('Searching the web:', query);

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
