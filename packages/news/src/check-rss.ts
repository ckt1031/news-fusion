import { requestEmbeddingsAPI } from '@ckt1031/ai';
import {
	checkArticleImportance,
	generateTitle,
	summarizeIntoShortText,
} from '@ckt1031/ai';
import {
	EARLIEST_HOURS,
	type RSSCatacory,
	type RSSChannelItem,
	type RSSConfig,
} from '@ckt1031/config';
import {
	addSimilarArticleToDatabase,
	checkIfNewsIsNew,
	createArticleDatabase,
} from '@ckt1031/db';
import { getContentMarkdownFromURL, scrapeMetaData } from '@ckt1031/tool-api';
import type { ServerEnv } from '@ckt1031/types';
import { logging } from '@ckt1031/utils';
import { getEncoding } from 'js-tiktoken';
import filterRSS from './filter-news';
import { parseRSS } from './parse-news';
import { getRSSHubURL } from './rsshub';
import { isArticleSimilar } from './similarity';

interface Props {
	env: ServerEnv;
	category: RSSCatacory;
	isTesting?: boolean;

	customCheckImportancePrompt?: string;
}

export function getChannelConfiguration(
	category: RSSCatacory,
	channel: RSSChannelItem,
	key: keyof RSSConfig,
	defaultValue: boolean | string,
) {
	return (
		(typeof channel === 'string' ? undefined : channel[key]) ??
		category[key] ??
		defaultValue
	);
}

function getToken(markdown: string) {
	const enc = getEncoding('cl100k_base');
	const tokens = enc.encode(markdown).length;

	return tokens;
}

export async function checkRSS({
	env,
	category,
	isTesting,
	customCheckImportancePrompt,
}: Props) {
	for (const channel of category.channels) {
		let url: string | undefined =
			typeof channel === 'string' ? channel : channel.url;

		// Try to get rsshub url if {RSSHUB} is in the url
		url = getRSSHubURL(env, url);

		if (!url) continue;

		logging.debug(`Checking RSS: ${url}`);

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
					});

					// Rejected if the news was already checked
					if (!isNew) continue;

					let autoSummarize = getChannelConfiguration(
						category,
						channel,
						'autoSummarize',
						true,
					);
					let checkImportance = getChannelConfiguration(
						category,
						channel,
						'checkImportance',
						true,
					);
					const scrapable = getChannelConfiguration(
						category,
						channel,
						'scrapable',
						true,
					);
					const publisherName = getChannelConfiguration(
						category,
						channel,
						'specificName',
						feed.title,
					);

					let thumbnail: string | undefined = item?.thumbnail;

					let title = item.title;
					let content = '';

					if (scrapable) {
						content = await getContentMarkdownFromURL(env, item.link);
					}

					if (content.length === 0) {
						logging.error('Got empty content from', item.link);

						// If content, importance check and auto summarize are meaningless
						autoSummarize = false;
						checkImportance = false;
					}

					let important = !checkImportance;

					let embedding: number[] | null = null;

					if (scrapable && content.length > 0) {
						title = await generateTitle(env, content);

						const embeddingText = content.slice(0, 8000);

						const tokens = getToken(content);

						if (tokens < 8000) {
							embedding = await requestEmbeddingsAPI({
								env,
								text: embeddingText,
								timeout: 5 * 1000,
							});
						}

						if (embedding) {
							const similar = await isArticleSimilar(embedding, item.link);

							// Reject if similar article found
							if (
								similar.similarities.length > 0 &&
								similar.result &&
								similar.similarities[0]
							) {
								const topSimilar = similar.similarities[0];

								logging.info(
									`Similar article found: ${item.link} -> ${topSimilar.url} (${topSimilar.similarity})`,
								);

								await addSimilarArticleToDatabase(topSimilar.url, item.link);

								continue;
							}
						}
					}

					if (checkImportance) {
						important = await checkArticleImportance(env, content, {
							customSystemPrompt: customCheckImportancePrompt,
						});

						logging.success(
							`${item.link} : `,
							`${important ? 'Important' : 'Not Important'}`,
						);
					}

					let shortSummary: string | undefined = undefined;

					if (important) {
						if (autoSummarize && content.length !== 0) {
							shortSummary = await summarizeIntoShortText(env, content);
							logging.success(`Short Summary ( ${item.link} ):`, shortSummary);
						}

						if (!thumbnail) {
							try {
								thumbnail = (await scrapeMetaData(env, item.link)).image;
							} catch (error) {
								logging.error('Failed to get thumbnail:', error);
							}
						}
					}

					await createArticleDatabase({
						important,
						title: title,
						url: item.link,
						publisher: publisherName as string,
						category: category.name,
						guid: item.guid,
						publishedAt: new Date(),
						embedding: scrapable ? embedding : null,
						summary: autoSummarize && shortSummary ? shortSummary : '',
						similarArticles: [],
					});
				} catch (error) {
					logging.error(error);
				}
			}
		} catch (error) {
			logging.error(error);
			if (isTesting) throw error;
		}
	}
}
