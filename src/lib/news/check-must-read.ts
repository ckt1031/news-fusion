import {
	EARLIEST_DAYS,
	MUST_READ_RSS_LIST,
	type RSS_CATEGORY,
} from '@/config/news-sources';
import type { ServerEnv } from '@/types/env';
import { saveArticle } from '.';
import { checkIfNewsIsNew } from '../db';
import { parseRSS } from '../parse-news';
import filterRSS from './filter-news';
import sendNewsToDiscord from './send-discord-news';

export default async function checkMustRead(env: ServerEnv) {
	// Handle Must Read RSS
	for (const rssCategory of Object.keys(MUST_READ_RSS_LIST)) {
		// Pick a random RSS from the list

		const list = MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY];

		// If the list is empty, skip
		if (!list || list.length === 0) {
			continue;
		}

		for (const rss of list) {
			try {
				const feed = await parseRSS(rss, EARLIEST_DAYS);

				for (const item of feed.item) {
					if (!filterRSS({ url: rss, title: item.title })) continue;

					const isNew = await checkIfNewsIsNew(env, item.guid);

					if (isNew) {
						await sendNewsToDiscord({
							env,
							data: {
								feed: {
									title: feed.title,
								},
								news: {
									title: item.title,
									link: item.link,
									pubDate: item.pubDate,
								},
							},
						});

						await saveArticle(env, {
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
