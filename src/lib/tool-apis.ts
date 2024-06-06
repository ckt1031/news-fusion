import type { ServerEnv } from '@/types/env';
import type { paths } from '@/types/tool-apis';
import createClient, { type Middleware } from 'openapi-fetch';

export type ScrapeMarkdownVar = Pick<
	ServerEnv,
	'TOOLS_API_BASE_URL' | 'TOOLS_API_KEY'
>;

function getClient(env: ScrapeMarkdownVar) {
	const client = createClient<paths>({ baseUrl: env.TOOLS_API_BASE_URL });

	const authMiddleware: Middleware = {
		async onRequest(req) {
			// set "foo" header
			req.headers.set('Authorization', `Bearer ${env.TOOLS_API_KEY}`);
			return req;
		},
	};

	client.use(authMiddleware);

	return client;
}

/** Get website major content in markdown format from personal API */
export async function scrapeToMarkdown(env: ScrapeMarkdownVar, url: string) {
	console.log('Scraping markdown from:', url);

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
	console.log('Scraping metadata from:', url);

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
	console.log('Scraping YouTube:', url);

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
