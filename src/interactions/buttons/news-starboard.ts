import type { MessageActionRowComponentBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import config from '../../../config.json';
import type { InteractionHandlers } from '../../sturctures/interactions';
import { ButtonCustomIds } from '../../sturctures/custom-id';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.AddToNewsStarboard,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    // Get embeds from interaction body.
    const embed = interaction.message.embeds[0];

    const channelFromId = interaction.client.channels.cache.get(config.news_starboard_channel);

    if (!channelFromId?.isTextBased()) return;

    const translateButton = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.TranslateNews)
      .setLabel('Translate')
      .setStyle(ButtonStyle.Secondary);

    const summarizeButton = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.SummarizeNews)
      .setLabel('Summarize')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      translateButton,
      summarizeButton,
    );

    await channelFromId.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.deferUpdate();
  },
};

export default button;
