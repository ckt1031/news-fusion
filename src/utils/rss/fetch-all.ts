import dayjs from 'dayjs';
import type { Client } from 'discord.js';
import Parser from 'rss-parser';

import type { RssFeedSource } from '@/models/RssFeedSources';
import logger from '@/utils/logger';

import { RssFeedChecksCache, RssSourcesCache } from './cache';
import type { RssFeed } from './types';

async function processSource(
  source: {
    name: string;
    enableRoleMention: boolean;
    url: string;
    aiFilterRequirement?: string;
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
          aiFilterRequirement: source.aiFilterRequirement,
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

export async function fetchAllRssFeeds(client: Client) {
  const parser = new Parser();
  const feeds: RssFeed[] = [];

  const cache = new RssSourcesCache();

  // Get an string array of all client joined guilds
  const guilds = client.guilds.cache.map(guild => guild.id);

  const allSources: RssFeedSource[] = [];

  for (const guild of guilds) {
    const sources = await cache.getAllSources(guild);

    if (!sources) continue;

    allSources.push(...sources);
  }

  for (const source of allSources) {
    const sourceFeeds = await processSource(
      {
        name: source.name,
        enableRoleMention: source.enableMentionRole,
        url: source.sourceURL,
        aiFilterRequirement: source.aiFilterRequirement,
      },
      parser,
      source.tag,
    );

    feeds.push(...sourceFeeds.flat());
  }

  logger.info(`Got ${feeds.length} RSS feeds to push to Discord.`);

  return feeds;
}
