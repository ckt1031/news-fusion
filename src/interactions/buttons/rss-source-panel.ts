import type { MessageActionRowComponentBuilder } from 'discord.js';
import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import { ButtonCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.RssSourcePanel,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('RSS Source Panel')
      .setDescription('Select an action to perform');

    const listSourceButton = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.ListRssSource)
      .setLabel('List Sources')
      .setStyle(ButtonStyle.Primary);

    const addSourceButton = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.AddRssSource)
      .setLabel('Add Source')
      .setStyle(ButtonStyle.Success);

    const addTagButton = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.AddRssSourceTag)
      .setLabel('Add Tag')
      .setStyle(ButtonStyle.Success);

    const deleteSourceButton = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.DeleteRssSource)
      .setLabel('Delete Source')
      .setStyle(ButtonStyle.Danger);

    const deleteTagButton = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.DeleteRssSourceTag)
      .setLabel('Delete Tag')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      listSourceButton,
      addSourceButton,
      addTagButton,
      deleteSourceButton,
      deleteTagButton,
    );

    await interaction.reply({
      ephemeral: true,
      embeds: [embed],
      components: [row],
    });
  },
};

export default button;
