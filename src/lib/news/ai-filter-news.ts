import {
	AI_FILTER_RSS_LINKS,
	EARLIEST_HOURS,
	type RSS_CATEGORY,
} from '@/config/news-sources';
import type { ServerEnv } from '@/types/env';
import { saveArticle } from '.';
import { checkIfNewsIsNew } from '../db';
import { checkArticleImportance } from '../llm';
import { parseRSS } from '../parse-news';
import { scrapeToMarkdown } from '../scrape';
import filterRSS from './filter-news';
import sendNewsToDiscord from './send-discord-news';

export default async function aiCheckFilter(env: ServerEnv) {
	for (const rssCategory of Object.keys(AI_FILTER_RSS_LINKS)) {
		const list = AI_FILTER_RSS_LINKS[rssCategory as RSS_CATEGORY];

		// If the list is empty, skip
		if (!list || list.length === 0) {
			continue;
		}

		for (const rss of list) {
			try {
				const feed = await parseRSS(rss, EARLIEST_HOURS);

				for (const item of feed.item) {
					if (!filterRSS({ url: rss, title: item.title })) continue;

					const isNew = await checkIfNewsIsNew(env, item.guid);

					if (!isNew) continue;

					const markdownContent = await scrapeToMarkdown(env, item.link);

					const result = await checkArticleImportance(env, `
					title: ${item.title}
					url: ${item.link}
					content: ${markdownContent}
					`);
					const isImportant = result.toLowerCase().includes('true');

					if (isImportant) {
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
					}

					await saveArticle(env, {
						importantEnough: isImportant,
						title: item.title,
						url: item.link,
						publisher: feed.title,
						category: rssCategory,
						guid: item.guid,
						publishedAt: new Date(item.pubDate).getTime(),
					});
				}
			} catch {}
		}
	}
}
