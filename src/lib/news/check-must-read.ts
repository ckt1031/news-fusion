import dayjs from 'dayjs';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { nanoid } from 'nanoid';
import {
	EARLIEST_DAYS,
	MUST_READ_RSS_LIST,
	type RSS_CATEGORY,
} from '../../config/news-sources';
import { discordMessage } from '../../discord/utils';
import { DISCORD_INTERACTION_BUTTONS } from '../../types/discord';
import type { ServerEnv } from '../../types/env';
import { checkIfNewsIsNew, createArticleDatabase } from '../db';
import { parseRSS } from '../parse-news';
import pickRandom from '../pick-random';

export default async function checkMustRead(env: ServerEnv) {
	// Handle Must Read RSS
	for (const rssCategory of Object.keys(MUST_READ_RSS_LIST)) {
		// Pick a random RSS from the list

		// Have env.D1 means cloudflare worker, cloudfare worker has limited subrequest,
		// so we need to pick a random rss to avoid hitting the limit
		const rssList =
			MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY].length > 3
				? env.D1
					? pickRandom(MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY], 3)
					: MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY]
				: MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY];

		for (const rss of rssList) {
			try {
				const feed = await parseRSS(rss);

				for (const item of feed.item) {
					// check if the news is within the last 3 days, use dayjs
					if (dayjs().diff(dayjs(item.pubDate), 'day') > EARLIEST_DAYS) {
						continue;
					}

					// If RSS has weather.gov.hk and title has 現時並無特別報告, skip
					if (
						rss.includes('weather.gov.hk') &&
						item.title.includes('現時並無特別報告')
					) {
						continue;
					}

					const isNew = await checkIfNewsIsNew(env, item.guid);

					if (isNew) {
						await discordMessage({
							env,
							channelId: env.DISCORD_RSS_CHANNEL_ID,
							method: 'POST',
							body: {
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
												custom_id:
													DISCORD_INTERACTION_BUTTONS.GENERATE_SUMMARIZE,
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
							},
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
			} catch (error) {
				console.error(error);
			}
		}
	}
}
