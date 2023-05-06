import type { ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import type { InteractionHandlers } from '../../sturctures/interactions';
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

    const modal = new ModalBuilder()
      .setCustomId('summarize_rss_news_action')
      .setTitle('News Summarization Prompts');

    const textModeInput = new TextInputBuilder()
      .setRequired(false)
      .setCustomId('text_mode')
      .setPlaceholder('Enter text mode')
      .setLabel('Text Modes [Concise, Balanced]')
      .setStyle(TextInputStyle.Short);

    const textLengthInput = new TextInputBuilder()
      .setRequired(false)
      .setCustomId('text_length_mode')
      .setPlaceholder('Enter text length')
      .setLabel('Text Length [Short, Normal, Detailed]')
      .setStyle(TextInputStyle.Short);

    const languageInput = new TextInputBuilder()
      .setRequired(false)
      .setCustomId('language')
      .setPlaceholder('Enter language (English / Chinese)')
      .setLabel('Language')
      .setStyle(TextInputStyle.Short);

    const articleUrlInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId('article_url')
      .setPlaceholder('Enter article URL')
      .setLabel('Article URL')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(url);

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textModeInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textLengthInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(languageInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(articleUrlInput),
    );

    await interaction.showModal(modal);

    logging.info('NEWS SUMMARIZATION: Sent modal');
  },
};

export default button;
