import url from 'node:url';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import type { Client, MessageActionRowComponentBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import normalizeUrl from 'normalize-url';
import Parser from 'rss-parser';

import config from '../../config.json';
import logger from '../utils/logger';
import { RssFeedChecksCache } from './cache';

dayjs.extend(utc);
dayjs.extend(timezone);

interface FeedItem {
  title: string;
  url: string;
  pubDate: string;

  // everything else is optional
  [key: string]: any;
}

interface RssFeed {
  title: string;
  url: string;
  tag: {
    name: string;
    channelId: string;
    mentionRoleId?: string;
    enableRoleMention: boolean;
  };
  data: Partial<FeedItem>;
}

async function fetchAllRssFeeds() {
  const parser = new Parser();

  const feeds: RssFeed[] = [];

  for (const [tag, sources] of Object.entries(config.rss_listener.sources)) {
    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.url);

        const tagData = config.rss_listener.tags.find(i => i.name === tag);

        if (!feed.title || !feed.link || !tagData) {
          continue;
        }

        for (const item of feed.items) {
          if (!item.pubDate) continue;

          // Ignore feeds older than 12 hours.
          if (dayjs(item.pubDate).valueOf() < Date.now() - 1000 * 60 * 60 * 5) continue;

          feeds.push({
            title: feed.title,
            url: feed.link,
            tag: {
              name: tagData.name,
              channelId: tagData.channelId,
              mentionRoleId: tagData.mentionRoleId,
              enableRoleMention: source.enableRoleMention,
            },
            data: item,
          });
        }
      } catch {
        logger.error(`Error fetching ${source.url}`);
      }
    }
  }

  return feeds;
}

export async function checkFeeds(client: Client) {
  try {
    const feeds = await fetchAllRssFeeds();

    for (const item of feeds) {
      const article = item.data;
      if (!article.url || !article.title || !article.pubDate) continue;

      try {
        const cache = new RssFeedChecksCache();

        const checkData = await cache.get({
          sourceURL: item.url,
          feedURL: article.url,
        });

        if (checkData && checkData.lastChecked < Date.now()) {
          continue;
        }

        const faviconURL = `https://www.google.com/s2/favicons?domain=${article.url}`;
        const publisherURL = `${url.parse(article.url).protocol ?? ''}//${
          url.parse(article.url).host ?? ''
        }`;

        // Get milliseconds of feed item
        const msSinceEpoch = dayjs(article.pubDate).valueOf();

        // Content subtraction
        const MAX_SNIPPET_LENGTH = 512;
        const snippet: string = article.contentSnippet ?? '';
        const truncatedSnippet: string =
          snippet.length > MAX_SNIPPET_LENGTH
            ? // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              snippet.slice(0, Math.max(0, MAX_SNIPPET_LENGTH)) + '...'
            : snippet;

        // Create embed
        const message = new EmbedBuilder()
          .setURL(article.url)
          .setTitle(article.title)
          .setAuthor({
            name: item.title,
            iconURL: faviconURL,
            url: publisherURL,
          })
          .setTimestamp(msSinceEpoch);

        if (truncatedSnippet.length > 0) message.setDescription(truncatedSnippet);

        // Image
        const raw_content: string = item.data['content:encoded'] || item.data.content;

        if (raw_content) {
          const img = raw_content.match(/<img[^>]+src="([^">]+)"/i);

          if (img?.[0] && img[0].startsWith('blob:')) message.setImage(normalizeUrl(img[1]));
        }

        if (item.data.media) {
          const url: string = item.data.media.content.url;

          if (!url.startsWith('blob:')) message.setImage(normalizeUrl(url));
        }

        if (item.data['media:thumbnail']) {
          const url: string = item.data['media:thumbnail']._attributes.url;

          if (!url.startsWith('blob:')) message.setImage(normalizeUrl(url));
        }

        if (item.data.enclosure && !item.data.enclosure.url.startsWith('blob:')) {
          message.setImage(normalizeUrl(item.data.enclosure.url as string));
        }

        // Send message
        const channel = client.channels.cache.get(item.tag.channelId);

        if (!channel?.isTextBased()) continue;

        const translateButton = new ButtonBuilder()
          .setCustomId('translate_rss_notification')
          .setLabel('Translate')
          .setStyle(ButtonStyle.Secondary);

        const summarizeButton = new ButtonBuilder()
          .setCustomId('summarize_rss_news')
          .setLabel('Summarize')
          .setStyle(ButtonStyle.Secondary);

        const starButton = new ButtonBuilder()
          .setCustomId('news-starboard-add')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          translateButton,
          summarizeButton,
          starButton,
        );

        await channel.send({
          embeds: [message],
          components: [row],
          ...(item.tag.enableRoleMention &&
            item.tag.mentionRoleId && {
              content: `<@&${item.tag.mentionRoleId}>`,
              allowedMentions: {
                roles: [item.tag.mentionRoleId],
              },
            }),
        });

        await cache.set({
          sourceURL: item.url,
          feedURL: article.url,
          lastChecked: Date.now(),
        });
      } catch (error) {
        logger.error(error);
        continue;
      }
    }
  } catch (error) {
    logger.error(error);
  }
}
