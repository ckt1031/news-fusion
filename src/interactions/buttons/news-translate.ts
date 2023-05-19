import translate from '@iamtraction/google-translate';
import type { MessageActionRowComponentBuilder, StringSelectMenuInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

import { ButtonCustomIds } from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';
import extractArticle from '../../utils/extract-article';
import logger from '../../utils/logger';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.TranslateNews,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    // Get embeds from interaction body.
    const embed = interaction.message.embeds[0];

    // Add language selection menu
    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('language-selection')
        .setPlaceholder('Select a language')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('MetaData: To English (United States)')
            .setValue('metadata:en'),
          new StringSelectMenuOptionBuilder()
            .setLabel('MetaData: To Chinese (Traditional Taiwan)')
            .setValue('metadata:zh-TW'),
          new StringSelectMenuOptionBuilder().setLabel('Source: To English').setValue('source:en'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Source: To Chinese (Traditional Taiwan)')
            .setValue('source:zh-TW'),
        ),
    );

    const user = interaction.client.users.cache.get(interaction.user.id);

    if (!user || !embed.data.title) return;

    const dmMessage = await user.send({
      content: 'Please select a language for me to translate this news 🤔',
      components: [row],
    });

    // Done
    await interaction.reply({
      ephemeral: true,
      content: `Sent in DM: ${dmMessage.url}`,
    });

    // Create a collector to wait for user to select a language
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
        // If user didn't select a language, delete the message
        await dmMessage.delete();

        return;
      }

      const selectedMenu = collected.first() as StringSelectMenuInteraction;

      await dmMessage.edit({
        content: `👌🏻 Keep your patience! Translating news **__${embed.data.title}__**`,
        components: [],
      });

      const language = selectedMenu.values[0].split(':')[1];

      // Translation Options
      const options = {
        to: language,
      };

      let desc = embed.data.description;

      if (selectedMenu.values[0].startsWith('source:') && embed.data.url) {
        const article = await extractArticle(embed.data.url);

        desc = article.parsedTextContent;

        // Google Translate has maxmium text value to be 5000
        if (desc.length > 2000) {
          desc = desc.slice(0, 1990) + '...';
        }
      }

      if (!desc) {
        desc = 'No description found.';
      }

      // Fetch Google Translate
      const translatedText = await translate(`Title: ${embed.data.title}\n\n${desc}`, options);

      await dmMessage.edit({
        content: `Translation: **${embed.data.title}**\nURL: ${embed.data.url}\n\n${translatedText.text}`,
      });

      // Log and record
      logger.info(`NEW TRANSLATION: Returned Result: ${embed.data.title}`);
    });
  },
};

export default button;
