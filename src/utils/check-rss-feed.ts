import url from 'node:url';

import * as Sentry from '@sentry/node';
import dayjs from 'dayjs';
import type { Client, MessageActionRowComponentBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import normalizeUrl from 'normalize-url';
import Parser from 'rss-parser';

import config from '../../config.json';
import RssSourceCheck from '../models/RssFeedChecks';
import logging from '../utils/logger';

export default async function checkRss(client: Client) {
  try {
    const parser = new Parser();

    let num_messages_sent = 0;
    let num_messages_failed = 0;

    for (const [tag, sources] of Object.entries(config.rss_listener.sources)) {
      for (const source of sources) {
        let feed;

        try {
          feed = await parser.parseURL(source.url);
        } catch {
          logging.error(`Error fetching ${source.url}`);
          continue;
        }

        const entries = feed.items
          .filter(item => {
            if (!item.pubDate) return false;

            // Ignore feeds older than 12 hours.
            return dayjs(item.pubDate).valueOf() > Date.now() - 1000 * 60 * 60 * 5;
          })
          // Sort to ascending order.
          .sort((a, b) => dayjs(a.pubDate).valueOf() - dayjs(b.pubDate).valueOf());

        // Ignore feeds with no entries.
        if (entries.length === 0) continue;

        for (const entry of entries) {
          try {
            if (!entry.link || !entry.title) continue;

            const checkData = await RssSourceCheck.findOne({
              sourceURL: source.url,
              feedURL: entry.link,
            });

            if (checkData?.lastChecked && checkData.lastChecked < Date.now()) continue;

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
                name: feed.title ?? publisherURL,
                iconURL: favicoURL,
                url: publisherURL,
              })
              .setDescription(truncatedSnippet)
              .setTimestamp(msSinceEpoch);

            // Image
            const raw_content: string = entry['content:encoded'] || entry.content;

            if (raw_content) {
              const img = raw_content.match(/<img[^>]+src="([^">]+)"/i);

              if (img?.[0] && img[0].startsWith('blob:')) message.setImage(normalizeUrl(img[1]));
            }

            if (entry.media) {
              const url: string = entry.media.content.url;

              if (!url.startsWith('blob:')) message.setImage(normalizeUrl(url));
            }

            if (entry['media:thumbnail']) {
              const url: string = entry['media:thumbnail']._attributes.url;

              if (!url.startsWith('blob:')) message.setImage(normalizeUrl(url));
            }

            if (entry.enclosure && !entry.enclosure.url.startsWith('blob:')) {
              message.setImage(normalizeUrl(entry.enclosure.url));
            }

            const tagData = config.rss_listener.tags.find(i => i.name === tag);

            if (!tagData) {
              logging.error(`${tag} does not have a valid channel ID!`);
              continue;
            }

            const channel = client.channels.cache.get(tagData.channelId);

            if (!channel?.isTextBased()) {
              logging.error(`${tag} does not have a valid channel!`);
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

            const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
              translateButton,
              summarizeButton,
            );

            await channel.send({
              embeds: [message],
              components: [row],
              ...(source.enableRoleMention &&
                tagData.mentionRoleId.length > 0 && {
                  content: `<@&${tagData.mentionRoleId}>`,
                  allowedMentions: {
                    roles: [tagData.mentionRoleId],
                  },
                }),
            });

            num_messages_sent += 1;

            if (checkData) {
              await RssSourceCheck.findOneAndUpdate(
                { sourceUR: source.url },
                {
                  lastChecked: Date.now(),
                },
              );
            } else {
              const newData = new RssSourceCheck({
                sourceURL: source.url,
                feedURL: entry.link,
                lastChecked: Date.now(),
              });

              await newData.save();
            }
          } catch (error) {
            logging.error(error);
            Sentry.captureException(error);
            num_messages_failed += 1;
          }
        }
      }
    }

    logging.info(
      `NEWS PUSH: Notification Pushed (${num_messages_sent}), Failed (${num_messages_failed})`,
    );
  } catch (error) {
    logging.error(error);
    Sentry.captureException(error);
  }
}
