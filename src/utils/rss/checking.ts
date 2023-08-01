import type { Client, MessageActionRowComponentBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { ButtonCustomIds } from '@/sturctures/custom-id';
import logger from '@/utils/logger';

import { RssFeedChecksCache } from './cache';
import { fetchAllRssFeeds } from './fetch-all';

export async function checkFeeds(client: Client) {
  logger.info('Checking RSS feeds...');

  // Fetch all feeds
  const feeds = await fetchAllRssFeeds(client);

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

        // Content subtraction
        const MAX_SNIPPET_LENGTH = 750;
        const snippet: string = article.contentSnippet ?? '';
        const truncatedSnippet: string =
          snippet.length > MAX_SNIPPET_LENGTH
            ? // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              snippet.slice(0, Math.max(0, MAX_SNIPPET_LENGTH)) + '...'
            : snippet;

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

        const mentionText =
          (tag.mentionRoleId ?? '').length > 9 && source.enableRoleMention
            ? `<@&${tag.mentionRoleId ?? ''}>`
            : '';
        const content = `## ${article.title}\n\n${truncatedSnippet}\n\n${article.url} ${mentionText}`;

        await channel.send({
          content,
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
