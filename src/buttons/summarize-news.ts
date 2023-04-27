import type { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

import extractArticle from '../utils/extract-article';
import logging from '../utils/logger';
import { cleanRequestPrompt } from '../utils/poe-com';

export default async function summarizeNewsButton(interaction: ButtonInteraction) {
  if (!interaction.channel) {
    return;
  }

  try {
    // Get embeds from interaction body.
    const embed = interaction.message.embeds[0];

    const url = embed.data.url;

    if (!url) return;

    // Add language selection menu
    const row = new ActionRowBuilder<any>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('language-selection')
        .setPlaceholder('Select a language')
        .addOptions(
          new StringSelectMenuOptionBuilder().setLabel('English').setValue('en'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Chinese (Traditional Taiwan)')
            .setValue('zh-TW'),
        ),
    );
    await interaction.reply({
      content: 'Please select a language for me to summarize this news 🤔',
      components: [row],
      ephemeral: true,
    });

    const languageCollector = interaction.channel.createMessageComponentCollector({
      max: 1,
      // Wait for user to select a language
      filter: i => i.customId === 'language-selection',
      time: 1000 * 60, // 1 minute to expire the message menu
    });

    languageCollector.on('end', async collected => {
      if (collected.size > 0) {
        const selectedMenu = collected.first() as StringSelectMenuInteraction;

        await interaction.editReply({
          content: '👌🏻 Keep your patience! Summarizing this news...',
          components: [],
        });

        const article = await extractArticle(url);

        if (!embed.data.title || !embed.data.url) {
          await interaction.editReply({
            content: 'Sorry, I cannot summarize this news 😢',
          });
          return;
        }

        const content =
          article.parsedTextContent.length > 1700
            ? article.parsedTextContent.slice(0, 1700) + '...'
            : article.parsedTextContent;

        logging.info(`Summarization Request: ${embed.data.title}`);

        const language = selectedMenu.values[0];

        const reply = await cleanRequestPrompt(
          `Title: ${embed.data.title}\n${content} (Please summarize this news in ${
            language === 'en' ? 'English' : 'Chinese Traditional (Taiwan)'
          } with professional tone, don't include any hyperlinks and urls, response with the text only!)`,
          // "chinchilla"
        );

        // Send a rinteraction reply
        await interaction.editReply({
          content: `${reply}\n\n[${embed.data.title}](${embed.data.url})`,
        });

        // Log and record
        logging.info(`Summarization Finished: ${embed.data.title}`);
      }
    });
  } catch (error) {
    logging.error(error);

    await interaction.reply({
      content: '😨 Error occurred when summarizing this news!',
      ephemeral: true,
    });
  }
}
