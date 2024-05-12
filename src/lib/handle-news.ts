import dayjs from 'dayjs';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { nanoid } from 'nanoid';
import removeTrailingSlash from 'remove-trailing-slash';
import {
	EARLIEST_DAYS,
	MUST_READ_RSS_LIST,
	type RSS_CATEGORY,
} from '../config/news-sources';
import { type NewArticle, articles } from '../db/schema';
import { sendDiscordMessage } from '../discord/utils';
import { DISCORD_INTERACTION_BUTTONS } from '../types/discord';
import type { ServerEnv } from '../types/env';
import { getDB } from './db';
import { parseRSS } from './parse-news';

export async function checkIfNewsIsNew(env: ServerEnv, guid: string) {
	const db = getDB(env.D1);

	const result = await db.query.articles.findFirst({
		// with: { url },
		where: (d, { eq }) => eq(d.guid, removeTrailingSlash(guid)),
	});

	return !result;
}

export async function createArticleDatabase(env: ServerEnv, data: NewArticle) {
	const db = getDB(env.D1);

	await db.insert(articles).values(data);
}

export async function cronCheckNews(env: ServerEnv) {
	// Handle Must Read RSS
	for (const rssCategory of Object.keys(MUST_READ_RSS_LIST)) {
		for (const rss of MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY]) {
			const feed = await parseRSS(rss);

			for (const item of feed.item) {
				// check if the news is within the last 3 days, use dayjs
				if (dayjs().diff(dayjs(item.pubDate), 'day') > EARLIEST_DAYS) {
					continue;
				}

				const isNew = await checkIfNewsIsNew(env, item.guid);

				if (isNew) {
					await sendDiscordMessage(env, env.DISCORD_RSS_CHANNEL_ID, {
						embeds: [
							{
								title: item.title,
								url: item.link,
								author: {
									name: feed.title,
								},
								timestamp: new Date(item.pubDate).toISOString(),
							},
						],
						components: [
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.Button,
										style: ButtonStyle.Secondary,
										label: 'Summarize',
										custom_id: DISCORD_INTERACTION_BUTTONS.SUMMARIZE,
									},
									{
										type: ComponentType.Button,
										style: ButtonStyle.Secondary,
										label: 'Translate',
										custom_id: DISCORD_INTERACTION_BUTTONS.TRANSLATE,
									},
								],
							},
						],
					});

					await createArticleDatabase(env, {
						id: nanoid(),
						importantEnough: true,
						title: item.title,
						url: item.link,
						publisher: feed.title,
						category: rssCategory,
						guid: item.guid,
						publishedAt: new Date(item.pubDate).getTime(),
					});
				}
			}
		}
	}
}
