import dayjs from 'dayjs';
import Parser from 'rss-parser';

import RssFeedSources from '@/models/RssFeedSources';
import logger from '@/utils/logger';

import { RssFeedChecksCache } from './cache';
import type { RssFeed } from './types';

async function processSource(
  source: {
    name: string;
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
      if (dayjs(item.pubDate).valueOf() < twelveHoursAgo || !item.link) continue;

      const cache = new RssFeedChecksCache();

      const checkData = await cache.get({
        sourceURL: source.url,
        feedURL: item.link,
      });

      // Ignore feeds that have been checked in the last 24 hours.
      if (checkData && checkData.lastChecked < Date.now()) {
        continue;
      }

      feeds.push({
        source: {
          title: source.name,
          url: source.url,
          enableRoleMention: source.enableRoleMention,
        },
        tag: {
          name: tagData.name,
          serverId: tagData.serverId,
          sendToChannelId: tagData.sendToChannelId,
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

  const allSources = await RssFeedSources.find().populate('tag');

  for (const source of allSources) {
    const sourceFeeds = await processSource(
      {
        name: source.name,
        enableRoleMention: source.enableMentionRole,
        url: source.sourceURL,
      },
      parser,
      source.tag,
    );

    feeds.push(...sourceFeeds.flat());
  }

  logger.info(`Got ${feeds.length} RSS feeds to push to Discord.`);

  return feeds;
}
