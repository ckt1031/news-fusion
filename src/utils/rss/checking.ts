import dayjs from 'dayjs';
import type { Client, MessageActionRowComponentBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import normalizeUrl from 'normalize-url';

import { ButtonCustomIds } from '../../sturctures/custom-id';
import logger from '../../utils/logger';
import { RssFeedChecksCache } from './cache';
import { fetchAllRssFeeds } from './fetch-all';

export async function checkFeeds(client: Client) {
  logger.info('Checking RSS feeds...');

  // Fetch all feeds
  const feeds = await fetchAllRssFeeds();

  try {
    for (const data of feeds) {
      const { article, source, tag } = data;

      if (!article.url || !article.title || !article.pubDate) continue;

      try {
        const cache = new RssFeedChecksCache();

        // Check if channelId is in the server
        const guild = client.guilds.cache.get(tag.serverId);
        const channel = client.channels.cache.get(tag.sendToChannelId);

        if (!guild || !channel || !channel.isTextBased() || !guild.channels.cache.has(channel.id)) {
          continue;
        }

        // Check if role is in the server
        const role =
          typeof tag.mentionRoleId === 'string' && tag.mentionRoleId !== '0'
            ? guild.roles.cache.get(tag.mentionRoleId)
            : undefined;

        if (typeof tag.mentionRoleId === 'string' && tag.mentionRoleId !== '0' && !role) {
          continue;
        }

        // Favicons
        const articleUrl = new URL(article.url);
        const faviconURL = `https://www.google.com/s2/favicons?domain=${articleUrl.hostname}`;
        const publisherURL = `${articleUrl.protocol}//${articleUrl.host}`;

        // Get milliseconds of feed item
        const msSinceEpoch = dayjs(article.pubDate).valueOf();

        // Content subtraction
        const MAX_SNIPPET_LENGTH = 768;
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
        const raw_content: string = article['content:encoded'] || article.content;

        if (raw_content) {
          const img = raw_content.match(/<img[^>]+src="([^">]+)"/i);

          if (img?.[0] && img[1].startsWith('http')) message.setImage(normalizeUrl(img[1]));
        }

        if (article.media) {
          const url: string = article.media.content.url;

          if (url.startsWith('http:')) message.setImage(normalizeUrl(url));
        }

        if (article['media:thumbnail']) {
          const url: string = article['media:thumbnail']._attributes.url;

          if (url.startsWith('http:')) message.setImage(normalizeUrl(url));
        }

        if (article.enclosure?.url.startsWith('http:')) {
          message.setImage(normalizeUrl(article.enclosure.url as string));
        }

        const translateButton = new ButtonBuilder()
          .setCustomId(ButtonCustomIds.TranslateNews)
          .setLabel('Translate')
          .setStyle(ButtonStyle.Secondary);

        const summarizeButton = new ButtonBuilder()
          .setCustomId(ButtonCustomIds.SummarizeNews)
          .setLabel('Summarize')
          .setStyle(ButtonStyle.Secondary);

        const starButton = new ButtonBuilder()
          .setCustomId(ButtonCustomIds.AddToNewsStarboard)
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
          ...(source.enableRoleMention &&
            tag.mentionRoleId && {
              content: `<@&${tag.mentionRoleId}>`,
              allowedMentions: {
                roles: [tag.mentionRoleId],
              },
            }),
        });

        await cache.set({
          sourceURL: source.url,
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
