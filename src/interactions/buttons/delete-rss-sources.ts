import type { ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import {
  ButtonCustomIds,
  CreateRssSourceModelFieldIds,
  ModalCustomIds,
} from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.DeleteRssSource,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(ModalCustomIds.DeleteRssSource)
      .setTitle('Delete RSS Source');

    const nameInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceModelFieldIds.Name)
      .setPlaceholder('Enter name')
      .setLabel('Name')
      .setStyle(TextInputStyle.Short);

    const tagNameInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceModelFieldIds.TagName)
      .setPlaceholder('Enter tag name')
      .setLabel('Tag Name')
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(tagNameInput),
    );

    await interaction.showModal(modal);
  },
};

export default button;
