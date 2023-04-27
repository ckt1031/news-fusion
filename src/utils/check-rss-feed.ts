import url from 'node:url';

import SHA256 from 'crypto-js/sha256';
import dayjs from 'dayjs';
import type { Client } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import pino from 'pino';
import { QuickDB } from 'quick.db';
import Parser from 'rss-parser';

import config from '../../config.json';

const logger = pino();

const db = new QuickDB();

export default async function checkRss(client: Client) {
  const parser = new Parser();

  let num_messages_sent = 0;

  for (const [tag, sources] of Object.entries(config.sources)) {
    for (const source of sources) {
      let feed;

      try {
        feed = await parser.parseURL(source);
      } catch {
        logger.error(`Error fetching ${source}`);
        continue;
      }

      const entries = feed.items
        .filter(item => {
          if (!item.pubDate) return false;

          const pubDate = new Date(item.pubDate);

          // Ignore feeds older than 12 hours.
          return dayjs(pubDate).valueOf() > Date.now() - 12 * 60 * 60 * 1000;
        })
        // Sort to ascending order.
        .sort((a, b) => dayjs(a.pubDate).valueOf() - dayjs(b.pubDate).valueOf());

      // Ignore feeds with no entries.
      if (entries.length === 0) continue;

      for (const entry of entries) {
        const feedKey = `${SHA256(source).toString()}.${SHA256(entry.link ?? '').toString()}`;

        const hasSent = await db.get(feedKey);

        if (hasSent || !entry.link || !entry.title) continue;

        const favicoURL = `https://www.google.com/s2/favicons?domain=${entry.link}`;
        const publisherURL = `${url.parse(entry.link).protocol ?? ''}//${
          url.parse(entry.link).host ?? ''
        }`;

        // Get milliseconds of feed item
        const date = dayjs(entry.pubDate);
        const msSinceEpoch = date.valueOf();

        // Content subtraction
        const MAX_SNIPPET_LENGTH = 512;
        const snippet = entry.contentSnippet ?? '';
        const truncatedSnippet =
          snippet.length > MAX_SNIPPET_LENGTH
            ? snippet.slice(0, Math.max(0, MAX_SNIPPET_LENGTH)) + '...'
            : snippet;

        // Create embed
        const message = new EmbedBuilder()
          .setURL(entry.link)
          .setTitle(entry.title)
          .setAuthor({
            name: entry.title,
            iconURL: favicoURL,
            url: `https://${publisherURL}`,
          })
          .setDescription(truncatedSnippet)
          .setTimestamp(msSinceEpoch);

        // Image
        const raw_content: string = entry['content:encoded'] || entry.content;

        if (raw_content) {
          const img = raw_content.match(/<img[^>]+src="([^">]+)"/i);

          if (img?.[0]) message.setImage(img[1]);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (entry.media) message.setImage(entry.media.content.url);

        if (entry['media:thumbnail']) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          message.setImage(entry['media:thumbnail']._attributes.url);
        }

        if (entry.enclosure) message.setImage(entry.enclosure.url);

        const channelId = Object.entries(config.tags_to_channels).find(key => key[0] === tag)?.[1];

        if (!channelId) {
          logger.error(`${tag} does not have a valid channel ID!`);
          continue;
        }

        const channel = client.channels.cache.get(channelId);

        if (!channel?.isTextBased()) {
          logger.error(`${tag} does not have a valid channel!`);
          continue;
        }

        const translateButton = new ButtonBuilder()
          .setCustomId('translate_rss_notification')
          .setLabel('Translate')
          .setStyle(ButtonStyle.Primary);

        const summarizeButton = new ButtonBuilder()
          .setCustomId('summarize_rss_news')
          .setLabel('Summarize (AI)')
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder<any>().addComponents(translateButton, summarizeButton);

        await channel.send({ embeds: [message], components: [row] });

        await db.set(feedKey, true);

        num_messages_sent += 1;
      }
    }
  }

  logger.info(`Notification Pushed: ${num_messages_sent}`);
}
