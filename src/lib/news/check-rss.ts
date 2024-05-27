import {
	EARLIEST_HOURS,
	type RSSList,
	type RSSListValue,
	type RSSSourceItem,
	type RSS_CATEGORY,
} from '@/config/news-sources';
import type { ServerEnv } from '@/types/env';
import { saveArticle } from '.';
import { checkIfNewsIsNew } from '../db';
import { checkArticleImportance, requestChatCompletionAPI } from '../llm';
import { parseRSS } from '../parse-news';
import { scrapeToMarkdown } from '../scrape';
import filterRSS from './filter-news';
import sendNewsToDiscord from './send-discord-news';

type Props = {
	env: ServerEnv;
	list: RSSList;
	allMustRead: boolean;
	isTesting?: boolean;
};

const getDisableAllComponents = (
	catagoryData: RSSListValue,
	rssItem: string | RSSSourceItem,
) => {
	const catagorySideDisableAllComponent = Array.isArray(catagoryData)
		? false
		: catagoryData.disableAllAIFunctions;
	const itemSideDisableAllComponent =
		typeof rssItem === 'string' ? false : rssItem.disableAllAIFunctions;
	return catagorySideDisableAllComponent || itemSideDisableAllComponent;
};

const getDisableAutoSummarize = (
	catagoryData: RSSListValue,
	rssItem: string | RSSSourceItem,
) => {
	const catagorySideDisableAutoSummarize = Array.isArray(catagoryData)
		? false
		: catagoryData.disableAutoSummary;
	const itemSideDisableAutoSummarize =
		typeof rssItem === 'string' ? false : rssItem.disableAutoSummary;
	return catagorySideDisableAutoSummarize || itemSideDisableAutoSummarize;
};

export default async function checkRSS({
	env,
	list,
	allMustRead,
	isTesting,
}: Props) {
	// Handle Must Read RSS
	for (const rssCategory of Object.keys(list)) {
		// Pick a random RSS from the list

		const catagoryData = list[rssCategory as RSS_CATEGORY];

		// If the list is empty, skip
		if (!catagoryData) continue;

		const rssListOfCatagory = Array.isArray(catagoryData)
			? catagoryData
			: catagoryData.items;

		for (const rssItem of rssListOfCatagory) {
			const url = typeof rssItem === 'string' ? rssItem : rssItem.source;
			try {
				const feed = await parseRSS(url, EARLIEST_HOURS);

				if (!feed || isTesting) continue;

				for (const item of feed.item) {
					if (!filterRSS({ url, title: item.title })) continue;

					const isNew = await checkIfNewsIsNew(env, item.guid);
					if (!isNew) continue;

					const disableAllComponents = getDisableAllComponents(
						catagoryData,
						rssItem,
					);
					const disableAutoSummarize = getDisableAutoSummarize(
						catagoryData,
						rssItem,
					);

					let importantEnough = true;
					let markdownContent = '';

					if (!allMustRead || !disableAutoSummarize) {
						markdownContent = await scrapeToMarkdown(env, item.link);
					}

					if (!allMustRead) {
						const result = await checkArticleImportance(
							env,
							`
					title: ${item.title}
					url: ${item.link}
					content: ${markdownContent}
					`,
						);
						importantEnough = result.toLowerCase().includes('true');
					}

					console.info(
						`${item.link}: `,
						`${importantEnough ? 'Important' : 'Not Important'}`,
					);

					if (importantEnough) {
						let shortSummary: string | undefined = undefined;

						if (!disableAutoSummarize) {
							shortSummary = await requestChatCompletionAPI({
								env,
								model: 'gpt-3.5-turbo',
								temperature: 0.1,
								message: {
									system:
										'Generate a 50-100 word summary for given article and content, only in plain text.',
									user: markdownContent,
								},
							});

							console.info(`Short Summary (${item.link}):`, shortSummary);
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
								disableAllComponents,
							},
						});
					}

					await saveArticle(env, {
						importantEnough,
						title: item.title,
						url: item.link,
						publisher: feed.title,
						category: rssCategory,
						guid: item.guid,
						publishedAt: new Date(item.pubDate).getTime(),
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
}
