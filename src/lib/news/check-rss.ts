import {
	EARLIEST_HOURS,
	type RssCatagory,
	type RssSourceItem,
} from '@/config/news-sources';
import type { ServerEnv } from '@/types/env';
import { nanoid } from 'nanoid';
import { checkIfNewsIsNew, createArticleDatabase } from '../db';
import { checkArticleImportance, requestChatCompletionAPI } from '../llm';
import { parseRSS } from '../parse-news';
import { scrapeToMarkdown } from '../scrape';
import filterRSS from './filter-news';
import { getRSSHubURL } from './rsshub';
import sendNewsToDiscord from './send-discord-news';

type Props = {
	env: ServerEnv;
	catagory: RssCatagory;
	allMustRead: boolean;
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

export default async function checkRSS({
	env,
	catagory,
	allMustRead,
	isTesting,
}: Props) {
	for (const source of catagory.sources) {
		let url: string | undefined =
			typeof source === 'string' ? source : source.url;

		url = getRSSHubURL(env, url);

		if (!url) continue;

		try {
			const feed = await parseRSS(url, EARLIEST_HOURS);

			console.info(`Checking RSS: ${url}`);

			if (!feed || isTesting) continue;

			for (const item of feed.item) {
				if (!filterRSS({ url, title: item.title })) continue;

				const isNew = await checkIfNewsIsNew(env, item.guid);
				if (!isNew) continue;

				const disableAllComponents = getDisableAllComponents(catagory, source);
				const disableAutoSummarize = getDisableAutoSummarize(catagory, source);

				let importantEnough = true;
				let markdownContent = '';

				if (!allMustRead || !disableAutoSummarize) {
					markdownContent = await scrapeToMarkdown(env, item.link);
				}

				const content = `
				title: ${item.title}
				url: ${item.link}
				content: ${markdownContent}
				`;

				if (!allMustRead) {
					const result = await checkArticleImportance(env, content);
					importantEnough = result.toLowerCase().includes('true');
				}

				console.info(
					`${item.link} : `,
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
									'Generate a 50-100 words summary with key points of given article and content, only in plain text, must be concise and precise.',
								user: content,
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

				await createArticleDatabase(env, {
					id: nanoid(),
					importantEnough,
					title: item.title,
					url: item.link,
					publisher: feed.title,
					category: catagory.name,
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
