import {
	EARLIEST_HOURS,
	type RSSCatacory,
	type RSSChannelItem,
	type RSSConfig,
} from '@/config/news-sources';
import type { ServerEnv } from '@/types/env';
import { checkIfNewsIsNew, createArticleDatabase } from '../db';
import { requestChatCompletionAPI, requestEmbeddingsAPI } from '../llm/api';
import { checkArticleImportance } from '../llm/prompt-calls';
import { parseRSS } from '../parse-news';
import {
	type ScrapeMarkdownVar,
	scrapeToMarkdown,
	scrapeYouTube,
} from '../tool-apis';
import filterRSS from './filter-news';
import { getRSSHubURL } from './rsshub';
import sendNewsToDiscord from './send-discord-news';

type Props = {
	env: ServerEnv;
	catagory: RSSCatacory;
	isTesting?: boolean;
};

function getConfiguration(
	catagory: RSSCatacory,
	channel: RSSChannelItem,
	key: keyof RSSConfig,
	defaultValue = false,
) {
	return (
		(typeof channel === 'string' ? undefined : channel[key]) ??
		catagory[key] ??
		defaultValue
	);
}

export async function getContentMakrdownFromURL(env: ScrapeMarkdownVar, url: string) {
	const host = new URL(url).host;

	if (host.includes('youtube.com')) {
		return (await scrapeYouTube(env, url)).captions?.text ?? '';
	}
	
	return await scrapeToMarkdown(env, url);
}

export default async function checkRSS({ env, catagory, isTesting }: Props) {
	for (const channel of catagory.channels) {
		let url: string | undefined =
			typeof channel === 'string' ? channel : channel.url;

		// Try to get rsshub url if {RSSHUB} is in the url
		url = getRSSHubURL(env, url);

		if (!url) continue;

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

				// Rejected if the news was already checked
				if (!isNew) continue;

				let autoSummarize = getConfiguration(
					catagory,
					channel,
					'autoSummarize',
					true,
				);
				const includeAIButtons = getConfiguration(
					catagory,
					channel,
					'includeAIButtons',
					true,
				);
				let checkImportance = getConfiguration(
					catagory,
					channel,
					'checkImportance',
					true,
				);

				let content = '';

				if (checkImportance || autoSummarize) {
					// We still need to get the content for importance check or auto summarize
					content = await getContentMakrdownFromURL(env, item.link);
					
					if (!content) {
						console.error('Failed to get content for', item.link);

						// If content, importance check and auto summarize are meaningless
						autoSummarize = false;
						checkImportance = false;
					}
				}

				let important = true;

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

					if (autoSummarize) {
						shortSummary = await requestChatCompletionAPI({
							env,
							model: 'gemini-1.5-flash-latest',
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
							...(autoSummarize && { description: shortSummary }),
							feed: {
								title: feed.title,
							},
							news: {
								title: item.title,
								link: item.link,
								pubDate: item.pubDate,
							},
							channelId: catagory.discordChannelId,
							includeAIButtons,
						},
					});
				}

				const embedding = await requestEmbeddingsAPI({
					env,
					text: content,
					model: 'text-embedding-3-small',
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
