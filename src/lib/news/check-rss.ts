import {
	EARLIEST_HOURS,
	type RSSCatacory,
	type RSSChannelItem,
	type RSSConfig,
} from '@/config/news-sources';
import embeddingTemplate from '@/prompts/embedding-template';
import type { ServerEnv } from '@/types/env';
import consola from 'consola';
import Mustache from 'mustache';
import {
	addSimilarArticleToDatabase,
	checkIfNewsIsNew,
	createArticleDatabase,
} from '../db';
import { requestEmbeddingsAPI } from '../llm/api';
import {
	checkArticleImportance,
	generateTitle,
	summarizeIntoShortText,
} from '../llm/prompt-calls';
import { parseRSS } from '../parse-news';
import { getContentMarkdownFromURL, scrapeMetaData } from '../tool-apis';
import filterRSS from './filter-news';
import { getRSSHubURL } from './rsshub';
// import sendNewsToDiscord from './send-discord-news';
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
				try {
					/**
					 * Single Item Area
					 */

					if (!filterRSS({ url, title: item.title })) continue;

					const isNew = await checkIfNewsIsNew({
						guid: item.guid,
						url: item.link,
						title: item.title,
					});

					// Rejected if the news was already checked
					if (!isNew) continue;

					let autoSummarize = getConfiguration(
						catagory,
						channel,
						'autoSummarize',
						true,
					);
					// const includeAIButtons = getConfiguration(
					// 	catagory,
					// 	channel,
					// 	'includeAIButtons',
					// 	true,
					// );
					let checkImportance = getConfiguration(
						catagory,
						channel,
						'checkImportance',
						true,
					);
					const scrapable = getConfiguration(
						catagory,
						channel,
						'scrapable',
						true,
					);

					let thumbnail: string | undefined = item?.thumbnail;

					let title = item.title;
					let content = '';

					if (scrapable) {
						content = await getContentMarkdownFromURL(env, item.link);
					}

					if (content.length === 0) {
						consola.error('Got empty content from', item.link);

						// If content, importance check and auto summarize are meaningless
						autoSummarize = false;
						checkImportance = false;
					}

					let important = !checkImportance;

					let embedding: number[] | null = null;

					if (scrapable && content.length > 0) {
						title = await generateTitle(env, content);

						const embeddingText = Mustache.render(embeddingTemplate, {
							// title: item.title,
							// link: item.link,
							pubDate: new Date(),
							content,
						});

						embedding = await requestEmbeddingsAPI({
							env,
							text: embeddingText,
							timeout: 5 * 1000,
						});

						if (embedding) {
							const similar = await isArticleSimilar(embedding, item.link);

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

								await addSimilarArticleToDatabase(topSimilar.url, item.link);

								continue;
							}
						}
					}

					if (checkImportance) {
						important = await checkArticleImportance(env, content, {
							trace: true,
						});

						consola.success(
							`${item.link} : `,
							`${important ? 'Important' : 'Not Important'}`,
						);
					}

					let shortSummary: string | undefined = undefined;

					if (important) {
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

						// await sendNewsToDiscord({
						// 	env,
						// 	data: {
						// 		...(autoSummarize &&
						// 			shortSummary && { description: shortSummary }),
						// 		feed: {
						// 			title: feed.title,
						// 		},
						// 		news: {
						// 			title: item.title,
						// 			link: item.link,
						// 			pubDate: item.pubDate,
						// 		},
						// 		channelId: catagory.discordChannelId,
						// 		includeAIButtons,
						// 		thumbnail,
						// 	},
						// });
					}

					await createArticleDatabase({
						important,
						title: title,
						url: item.link,
						publisher: feed.title,
						category: catagory.name,
						guid: item.guid,
						publishedAt: new Date(),
						embedding: scrapable ? embedding : null,
						summary: autoSummarize && shortSummary ? shortSummary : '',
					});
				} catch (error) {
					consola.error(error);
				}
			}
		} catch (error) {
			consola.error(error);
			if (isTesting) throw error;
		}
	}
}
