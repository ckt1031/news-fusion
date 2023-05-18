import dayjs from 'dayjs';
import Parser from 'rss-parser';

import config from '../../../config.json';
import logger from '../../utils/logger';
import type { RssFeed } from './types';

async function processSource(
  source: {
    enableRoleMention: boolean;
    url: string;
  },
  parser: Parser,
  tagData: RssFeed['tag'],
) {
  const feeds: RssFeed[] = [];
  const twelveHoursAgo = Date.now() - 1000 * 60 * 60 * 12;

  try {
    const feed = await parser.parseURL(source.url);

    if (!feed.title || !feed.link) {
      return feeds;
    }

    for (const item of feed.items) {
      if (!item.pubDate) continue;

      // Ignore feeds older than 12 hours.
      if (dayjs(item.pubDate).valueOf() < twelveHoursAgo) continue;

      feeds.push({
        source: {
          title: feed.title,
          url: feed.link,
          enableRoleMention: source.enableRoleMention,
        },
        tag: {
          name: tagData.name,
          channelId: tagData.channelId,
          mentionRoleId: tagData.mentionRoleId,
        },
        article: {
          title: item.title,
          url: item.link,
          pubDate: item.pubDate,
          ...item,
        },
      });
    }
  } catch {
    logger.error(`Error fetching ${source.url}`);
  }

  return feeds;
}

export async function fetchAllRssFeeds() {
  const parser = new Parser();
  const feeds: RssFeed[] = [];

  for (const [tag, sources] of Object.entries(config.rss_listener.sources)) {
    const tagData = config.rss_listener.tags.find(i => i.name === tag);

    if (!tagData) {
      logger.error(`No tag found for ${tag}`);
      continue;
    }

    const sourcePromises = sources.map(source => processSource(source, parser, tagData));
    const sourceFeeds = await Promise.all(sourcePromises);
    feeds.push(...sourceFeeds.flat());
  }

  logger.info(`Fetched ${feeds.length} RSS feeds.`);
  return feeds;
}
