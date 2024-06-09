import {
	EARLIEST_HOURS,
	type RSSCatacory,
	type RSSChannelItem,
	type RSSConfig,
} from '@/config/news-sources';
import type { ServerEnv } from '@/types/env';
import consola from 'consola';
import {
	addSimilarArticleToDatabase,
	checkIfNewsIsNew,
	createArticleDatabase,
} from '../db';
import { requestEmbeddingsAPI } from '../llm/api';
import {
	checkArticleImportance,
	summarizeIntoShortText,
} from '../llm/prompt-calls';
import { parseRSS } from '../parse-news';
import { getContentMakrdownFromURL, scrapeMetaData } from '../tool-apis';
import filterRSS from './filter-news';
import { getRSSHubURL } from './rsshub';
import sendNewsToDiscord from './send-discord-news';
import { isArticleSimilar } from './similarity';

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

export default async function checkRSS({ env, catagory, isTesting }: Props) {
	for (const channel of catagory.channels) {
		let url: string | undefined =
			typeof channel === 'string' ? channel : channel.url;

		// Try to get rsshub url if {RSSHUB} is in the url
		url = getRSSHubURL(env, url);

		if (!url) continue;

		console.debug(`Checking RSS: ${url}`);

		try {
			const feed = await parseRSS(url, EARLIEST_HOURS);

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

				let thumbnail: string | undefined = item?.thumbnail;

				const content = await getContentMakrdownFromURL(env, item.link);

				if (content.length === 0) {
					consola.error('Failed to get content for', item.link);

					// If content, importance check and auto summarize are meaningless
					autoSummarize = false;
					checkImportance = false;
				}

				let embedding: number[] = [];
				let important = !checkImportance;

				if (content.length !== 0) {
					embedding = await requestEmbeddingsAPI({
						env,
						text: content,
						timeout: 5 * 1000,
					});

					const similar = await isArticleSimilar(env, embedding, item.link);

					// Reject if similar article found
					if (
						similar.similarities.length > 0 &&
						similar.result &&
						similar.similarities[0]
					) {
						const topSimilar = similar.similarities[0];

						consola.box(
							`Similar article found: ${item.link} -> ${topSimilar.url} (${topSimilar.similarity})`,
						);

						await addSimilarArticleToDatabase(env, item.link, topSimilar.url);

						continue;
					}

					if (checkImportance) {
						important = await checkArticleImportance(env, content, {
							trace: true,
						});
					}

					consola.success(
						`${item.link} : `,
						`${important ? 'Important' : 'Not Important'}`,
					);
				}

				if (important) {
					let shortSummary: string | undefined = undefined;

					if (autoSummarize && content.length !== 0) {
						shortSummary = await summarizeIntoShortText(env, content);
						consola.success(`Short Summary ( ${item.link} ):`, shortSummary);
					}

					if (!thumbnail) {
						try {
							thumbnail = (await scrapeMetaData(env, item.link)).image;
						} catch (error) {
							consola.error('Failed to get thumbnail:', error);
						}
					}

					await sendNewsToDiscord({
						env,
						data: {
							...(autoSummarize &&
								shortSummary && { description: shortSummary }),
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
							thumbnail,
						},
					});
				}

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
			consola.error(error);
			if (isTesting) throw error;
		}
	}
}
