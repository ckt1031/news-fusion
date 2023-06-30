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
  customId: ButtonCustomIds.AddRssSource,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(ModalCustomIds.CreateRssSource)
      .setTitle('Create RSS Source');

    const nameInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceModelFieldIds.Name)
      .setPlaceholder('Enter name')
      .setLabel('Name')
      .setStyle(TextInputStyle.Short);

    const urlInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceModelFieldIds.SourceUrl)
      .setPlaceholder('Enter source URL')
      .setLabel('Source URL')
      .setStyle(TextInputStyle.Short);

    const roleIdInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceModelFieldIds.MentionRoleId)
      .setPlaceholder('Enter mention role ID')
      .setLabel('Mention Role ID')
      .setStyle(TextInputStyle.Short);

    const tagInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceModelFieldIds.TagName)
      .setPlaceholder('Enter tag name')
      .setLabel('Tag Name')
      .setStyle(TextInputStyle.Short);

    const enableRoleMentioningInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceModelFieldIds.EnableRoleMention)
      .setPlaceholder('true or false')
      .setLabel('Enable Role Mention?')
      .setStyle(TextInputStyle.Short);

    const aiFilterRequrementInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(CreateRssSourceModelFieldIds.AI_FILTER_REQUIREMENT)
      .setPlaceholder(
        'Example: I want the signifant news only, with no review, gossip or opinion pieces.',
      )
      .setLabel('AI Filter Requirement?')
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(urlInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(tagInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(roleIdInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        enableRoleMentioningInput,
      ),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(aiFilterRequrementInput),
    );

    await interaction.showModal(modal);
  },
};

export default button;
