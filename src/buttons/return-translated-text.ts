import translate from '@iamtraction/google-translate';
import type { ButtonInteraction, CacheType, StringSelectMenuInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import pino from 'pino';

import extractArticle from '../utils/extract-article';

const logger = pino();

export default async function returnTranslatedButton(interaction: ButtonInteraction) {
  if (!interaction.channel) {
    return;
  }

  try {
    // Get embeds from interaction body.
    const embed = interaction.message.embeds[0];

    // Add language selection menu
    const row = new ActionRowBuilder<any>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('language-selection')
        .setPlaceholder('Select a language')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('MetaData: To English')
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

    await interaction.reply({
      content: 'Please select a language for me to translate this news 🤔',
      components: [row],
      ephemeral: true,
    });

    // Create a collector to wait for user to select a language
    const languageCollector = interaction.channel.createMessageComponentCollector({
      max: 1,
      // Wait for user to select a language
      filter: i => i.customId === 'language-selection',
      time: 1000 * 60, // 1 minute to expire the message menu
    });

    languageCollector.on('end', async collected => {
      if (collected.size > 0) {
        const selectedMenu = collected.first() as StringSelectMenuInteraction<CacheType>;

        await interaction.editReply({
          content: '👌🏻 Keep your patience! Translating this news...',
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

          if (article) {
            desc = article.parsedTextContent;

            // Google Translate has maxmium text value to be 5000
            if (desc.length > 2000) {
              desc = desc.slice(0, 1990) + '...';
            }
          }
        }

        // Fetch Google Translate
        const translatedText = await translate(`${embed.data.title}\n\n${desc}`, options);

        // Send a rinteraction reply
        await interaction.editReply({
          content: translatedText.text,
        });

        // Log and record
        logger.info(`Translate Request: ${embed.data.title}`);
      }
    });
  } catch (error) {
    logger.error(error);

    await interaction.reply({
      content: '😨 Error occurred when translating this news!',
      ephemeral: true,
    });
  }
}
