import type { MessageActionRowComponentBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import Settings from '@/models/Settings';
import { ButtonCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.AddToNewsStarboard,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    // Get embeds from interaction body.
    const embed = interaction.message.embeds[0];

    const serverId = interaction.guildId;

    const serverData = await Settings.findOne({ serverId });

    if (!serverData) return;

    // check if disabled enableNewsStarboard
    if (!serverData.enableNewsStarboard || !interaction.guild) return;

    const channelFromId = interaction.guild.channels.cache.get(serverData.rssStarboardChannelId);

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
