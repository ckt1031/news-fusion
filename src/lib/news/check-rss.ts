import {
	EARLIEST_HOURS,
	type RssCatagory,
	type RssSourceItem,
} from '@/config/news-sources';
import type { ServerEnv } from '@/types/env';
import type { RssFeed } from '@/types/rss';
import { checkIfNewsIsNew, createArticleDatabase } from '../db';
import { requestChatCompletionAPI, requestEmbeddingsAPI } from '../llm/api';
import { checkArticleImportance } from '../llm/prompt-calls';
import { parseRSS } from '../parse-news';
import { type ScrapeMarkdownVar, scrapeToMarkdown } from '../scrape';
import filterRSS from './filter-news';
import { getRSSHubURL } from './rsshub';
import sendNewsToDiscord from './send-discord-news';

type Props = {
	env: ServerEnv;
	catagory: RssCatagory;
	isTesting?: boolean;
};

const getDisableAllComponents = (
	catagoryData: RssCatagory,
	rssItem: RssSourceItem,
) => {
	const catagorySideDisableAllComponent = catagoryData.disableAllAIFunctions;
	const itemSideDisableAllComponent =
		typeof rssItem === 'string' ? false : rssItem.disableAllAIFunctions;
	return catagorySideDisableAllComponent || itemSideDisableAllComponent;
};

const getDisableAutoSummarize = (
	catagoryData: RssCatagory,
	rssItem: RssSourceItem,
) => {
	const catagorySideDisableAutoSummarize = catagoryData.disableAutoSummary;
	const itemSideDisableAutoSummarize =
		typeof rssItem === 'string' ? false : rssItem.disableAutoSummary;
	return catagorySideDisableAutoSummarize || itemSideDisableAutoSummarize;
};

export async function urlToLLMContent(
	env: ScrapeMarkdownVar,
	item: ArrayElement<RssFeed['item']>,
) {
	const markdownContent = await scrapeToMarkdown(env, item.link);

	return `
	title: ${item.title}
	url: ${item.link}
	content: ${markdownContent}
	`;
}

export default async function checkRSS({ env, catagory, isTesting }: Props) {
	for (const source of catagory.sources) {
		let url: string | undefined =
			typeof source === 'string' ? source : source.url;

		// Try to get rsshub url if {RSSHUB} is in the url
		url = getRSSHubURL(env, url);

		if (!url) continue;

		const checkImportance =
			(typeof source === 'string' ? false : source.checkImportance) ||
			(catagory.checkImportance ?? true);

		try {
			const feed = await parseRSS(url, EARLIEST_HOURS);

			console.info(`Checking RSS: ${url}`);

			// Skip if no feed, or testing mode
			if (!feed || isTesting) continue;

			for (const item of feed.item) {
				/**
				 * Single Item Area
				 */

				if (!filterRSS({ url, title: item.title })) continue;

				const isNew = await checkIfNewsIsNew(env, item.guid);
				if (!isNew) continue;

				const disableAllComponents = getDisableAllComponents(catagory, source);
				const disableAutoSummarize = getDisableAutoSummarize(catagory, source);

				let important = true;

				let content = '';

				if (checkImportance || !disableAutoSummarize) {
					content = await urlToLLMContent(env, item);
				}

				if (checkImportance) {
					important = await checkArticleImportance(env, content, {
						trace: true,
						useGPT4o: true,
					});
				}

				console.info(
					`${item.link} : `,
					`${important ? 'Important' : 'Not Important'}`,
				);

				if (important) {
					let shortSummary: string | undefined = undefined;

					if (!disableAutoSummarize) {
						shortSummary = await requestChatCompletionAPI({
							env,
							model: 'gpt-3.5-turbo',
							temperature: 0.1,
							message: {
								system:
									'Generate a 50-100 words summary with only key points and main ideas of given article and content, only in plain text, must be concise and precise.',
								user: content,
							},
							trace: {
								name: 'summarize-article-briefly',
							},
						});

						console.info(`Short Summary ( ${item.link} ):`, shortSummary);
					}

					await sendNewsToDiscord({
						env,
						data: {
							...(!disableAutoSummarize && { description: shortSummary }),
							feed: {
								title: feed.title,
							},
							news: {
								title: item.title,
								link: item.link,
								pubDate: item.pubDate,
							},
							channelId: catagory.discordChannelId,
							disableAllComponents,
						},
					});
				}

				const embedding = await requestEmbeddingsAPI({
					env,
					text: content,
				});

				await createArticleDatabase(env, {
					important,
					title: item.title,
					url: item.link,
					publisher: feed.title,
					category: catagory.name,
					guid: item.guid,
					publishedAt: new Date(item.pubDate),
					embedding,
				});
			}
		} catch (error) {
			console.error(error);
			if (isTesting && error instanceof Error) {
				throw error;
			}
		}
	}
}
