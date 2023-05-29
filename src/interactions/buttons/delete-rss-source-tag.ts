import type { ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import {
  ButtonCustomIds,
  DeleteRssSourceTagModelFieldIds,
  ModalCustomIds,
} from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';

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
      .setCustomId(DeleteRssSourceTagModelFieldIds.Name)
      .setPlaceholder('Enter name')
      .setLabel('Name')
      .setStyle(TextInputStyle.Short);

    const deleteSourcesInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(DeleteRssSourceTagModelFieldIds.DeleteAllSources)
      .setPlaceholder('Enter true or false')
      .setLabel('Delete all sources that use this tag')
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(deleteSourcesInput),
    );

    await interaction.showModal(modal);
  },
};

export default button;
