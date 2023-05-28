import type { ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import {
  ButtonCustomIds,
  CreateRssSourceTagModelFieldIds,
  ModalCustomIds,
} from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.AddRssSourceTag,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(ModalCustomIds.CreateRssSourceTag)
      .setTitle('Create RSS Source Tag');

    const nameInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceTagModelFieldIds.Name)
      .setPlaceholder('Enter name')
      .setLabel('Name')
      .setStyle(TextInputStyle.Short);

    const channelIdInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceTagModelFieldIds.SendToChannelId)
      .setPlaceholder('Enter channel ID')
      .setLabel('Send To Channel ID')
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(channelIdInput),
    );

    await interaction.showModal(modal);
  },
};

export default button;
