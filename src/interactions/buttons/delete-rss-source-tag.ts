import type { ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import {
  ButtonCustomIds,
  CreateRssSourceModelFieldIds,
  ModalCustomIds,
} from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.DeleteRssSourceTag,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(ModalCustomIds.DeleteRssSourceTag)
      .setTitle('Delete RSS Source Tag');

    const nameInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceModelFieldIds.Name)
      .setPlaceholder('Enter name')
      .setLabel('Name')
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput),
    );

    await interaction.showModal(modal);
  },
};

export default button;
