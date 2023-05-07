import url from 'node:url';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface RssFeed {
  source: {
    title: string;
    url: string;
  };
  tag: {
    name: string;
    channelId: string;
    mentionRoleId?: string;
    enableRoleMention: boolean;
  };
  article: Partial<FeedItem>;
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
            source: {
              title: feed.title,
              url: feed.link,
            },
            tag: {
              name: tagData.name,
              channelId: tagData.channelId,
              mentionRoleId: tagData.mentionRoleId,
              enableRoleMention: source.enableRoleMention,
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
        continue;
      }
    }
  }

  logger.info(`Fetched ${feeds.length} RSS feeds.`);

  return feeds;
}

export async function checkFeeds(client: Client) {
  logger.info('Checking RSS feeds...');

  const feeds = await fetchAllRssFeeds();

  try {
    for (const data of feeds) {
      const { article, source, tag } = data;

      console.log(0);

      if (!article.url || !article.title || !article.pubDate) continue;

      console.log(1);

      try {
        const cache = new RssFeedChecksCache();

        const checkData = await cache.get({
          sourceURL: source.url,
          feedURL: article.url,
        });

        if (checkData && checkData.lastChecked < Date.now()) {
          continue;
        }

        console.log(2);

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
            name: source.title,
            iconURL: faviconURL,
            url: publisherURL,
          })
          .setTimestamp(msSinceEpoch);

        if (truncatedSnippet.length > 0) message.setDescription(truncatedSnippet);

        // Image
        const raw_content: string = article.data['content:encoded'] || article.content;

        if (raw_content) {
          const img = raw_content.match(/<img[^>]+src="([^">]+)"/i);

          if (img?.[0] && img[0].startsWith('blob:')) message.setImage(normalizeUrl(img[1]));
        }

        if (article.media) {
          const url: string = article.media.content.url;

          if (!url.startsWith('blob:')) message.setImage(normalizeUrl(url));
        }

        if (article['media:thumbnail']) {
          const url: string = article['media:thumbnail']._attributes.url;

          if (!url.startsWith('blob:')) message.setImage(normalizeUrl(url));
        }

        if (article.enclosure && !article.enclosure.url.startsWith('blob:')) {
          message.setImage(normalizeUrl(article.enclosure.url as string));
        }

        // Send message
        const channel = client.channels.cache.get(tag.channelId);

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
          ...(tag.enableRoleMention &&
            tag.mentionRoleId && {
              content: `<@&${tag.mentionRoleId}>`,
              allowedMentions: {
                roles: [tag.mentionRoleId],
              },
            }),
        });

        await cache.set({
          sourceURL: article.url,
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
