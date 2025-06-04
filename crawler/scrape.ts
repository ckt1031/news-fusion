import { extract } from '@extractus/article-extractor';

export async function scrapeArticle(url: string) {
	const data = await extract(url);

	if (!data || !data.content)
		throw new Error(`Failed to scrape article from ${url}`);

	return data;
}
