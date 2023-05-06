import type { MessageActionRowComponentBuilder, StringSelectMenuInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

import { getResponse } from '../../ai/edge-gpt';
import type { InteractionHandlers } from '../../sturctures/interactions';
import extractArticle from '../../utils/extract-article';
import logging from '../../utils/logger';

const button: InteractionHandlers = {
  type: 'button',
  customId: 'summarize_rss_news',
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    // Get embeds from interaction body.
    const embed = interaction.message.embeds[0];

    const url = embed.data.url;

    if (!url) return;

    // Add language selection menu
    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('language-selection')
        .setPlaceholder('Select a language')
        .addOptions(
          new StringSelectMenuOptionBuilder().setLabel('English (United States)').setValue('en-US'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Chinese (Traditional Taiwan)')
            .setValue('zh-TW'),
        ),
    );

    const user = interaction.client.users.cache.get(interaction.user.id);

    if (!user) return;

    if (!embed.data.title || !embed.data.url) {
      await interaction.reply({
        content: 'Sorry, I cannot summarize this news 😢',
      });

      return;
    }

    const dmMessage = await user.send({
      content: `Please select a language for me to summarize this news 🤔\n\nTitle: ${embed.data.title}\nURL: ${embed.data.url}`,
      components: [row],
    });

    // Done
    await interaction.reply({
      ephemeral: true,
      content: `Sent in DM: ${dmMessage.url}`,
    });

    const languageCollector = dmMessage.channel.createMessageComponentCollector({
      max: 1,
      // Wait for user to select a language
      filter: i =>
        i.customId === 'language-selection' &&
        i.user.id === interaction.user.id &&
        i.message.id === dmMessage.id,
      time: 1000 * 60, // 1 minute to expire the message menu
    });

    languageCollector.on('end', async collected => {
      if (collected.size === 0 || !embed.data.title || !embed.data.url) {
        await dmMessage.delete();

        return;
      }

      const selectedMenu = collected.first() as StringSelectMenuInteraction;

      await dmMessage.edit({
        content: `👌🏻 Keep your patience! Summarizing news into ${
          selectedMenu.values[0] === 'en-US' ? 'English (US)' : 'Chinese Traditional (Taiwan)'
        }: **__${embed.data.title}__**`,
        components: [],
      });

      const article = await extractArticle(url);

      const content =
        article.parsedTextContent.length > 1700
          ? article.parsedTextContent.slice(0, 1700) + '...'
          : article.parsedTextContent;

      logging.info(`NEW TRANSLATION: Request: ${embed.data.title}`);

      const language = selectedMenu.values[0];

      const reply = await getResponse(
        `Title: ${embed.data.title}\n${content} (Please summarize this news in ${
          language === 'en-US'
            ? 'English (US)'
            : 'Chinese Traditional (Taiwan ZH_TW) (NO SIMPLIFIED)'
        } with professional tone and include details info, don't include any hyperlinks, response with the text only under 1700 word length)`,
      );

      await dmMessage.edit({
        content: `AI Summary: **${embed.data.title}**\nURL: ${embed.data.url}\n\n${reply}`,
      });

      // Log and record
      logging.info(`NEWS SUMMARIZING: Returned result: ${embed.data.title}`);
    });
  },
};

export default button;
