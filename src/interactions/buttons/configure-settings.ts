import type { ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import Settings from '../../models/Settings';
import {
  ButtonCustomIds,
  ModalCustomIds,
  ServerConfigurationModelFieldIds,
} from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.ManageServerConfig,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const serverId = interaction.guildId;

    // Get server settings
    let settings = await Settings.findOne({ serverId });

    if (!settings) {
      // Create new settings
      settings = new Settings({
        serverId,
      });

      await settings.save();
    }

    const modal = new ModalBuilder()
      .setCustomId(ModalCustomIds.ServerConfigurations)
      .setTitle('Server Configurations');

    const starboardChannelIdInput = new TextInputBuilder()
      .setRequired(false)
      .setCustomId(ServerConfigurationModelFieldIds.RssStarboardChannelId)
      .setPlaceholder('Enter RSS Starboard Channel ID')
      .setLabel('RSS Starboard Channel ID')
      .setValue(settings.rssStarboardChannelId)
      .setStyle(TextInputStyle.Short);

    const toggleStarboardInput = new TextInputBuilder()
      .setRequired(false)
      .setCustomId(ServerConfigurationModelFieldIds.EnableNewsStarboard)
      .setPlaceholder('true or false')
      .setLabel('Enable RSS Starboard (true/false)')
      .setValue(String(settings.enableNewsStarboard))
      .setStyle(TextInputStyle.Short);

    const toggleNewsSummarizingInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(ServerConfigurationModelFieldIds.EnableNewsSummarizing)
      .setPlaceholder('Enter true or false')
      .setLabel('Enable News Summarizing (true/false)')
      .setStyle(TextInputStyle.Short)
      .setValue(String(settings.enableNewsSummarizing));

    const toggleNewsTranslationInput = new TextInputBuilder()
      .setRequired(true)
      .setCustomId(ServerConfigurationModelFieldIds.EnableNewsTranslation)
      .setPlaceholder('Enter true or false')
      .setLabel('Enable News Translation (true/false)')
      .setStyle(TextInputStyle.Short)
      .setValue(String(settings.enableNewsTranslation));

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(starboardChannelIdInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(toggleStarboardInput),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        toggleNewsSummarizingInput,
      ),
    );

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        toggleNewsTranslationInput,
      ),
    );

    await interaction.showModal(modal);
  },
};

export default button;
