import type { ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import { ButtonCustomIds, ModalCustomIds } from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';
import logging from '../../utils/logger';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.SummarizeNews,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    // Get embeds from interaction body.
    const embed = interaction.message.embeds[0];

    const url = embed.data.url;

    if (!url) return;

    const modal = new ModalBuilder()
      .setCustomId(ModalCustomIds.SummarizeNewsAction)
      .setTitle('News Summarization Prompts');

    const textLengthInput = new TextInputBuilder()
      .setRequired(false)
      .setCustomId('text_length_mode')
      .setPlaceholder('Enter text length (1.Short, 2.Normal, 3.Detailed)')
      .setLabel('Text Length')
      .setStyle(TextInputStyle.Short);

    const languageInput = new TextInputBuilder()
      .setRequired(false)
      .setCustomId('language')
      .setPlaceholder('Enter language (1.English, 2.Chinese)')
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
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textLengthInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(languageInput),
    );
    
    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(articleUrlInput),
    );

    // await interaction.showModal(modal);

    logging.info('NEWS SUMMARIZATION: Sent modal');
  },
};

export default button;
