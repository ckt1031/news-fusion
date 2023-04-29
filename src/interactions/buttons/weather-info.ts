import type { ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import type { InteractionHandlers } from '../../sturctures/interactions';
import logging from '../../utils/logger';

const button: InteractionHandlers = {
  type: 'button',
  customId: 'weatherdashboard-show_info',
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('WEATHER_DASHBOARD-INFO_MODAL')
      .setTitle('Weather Information');

    const locationInput = new TextInputBuilder()
      .setCustomId('location')
      .setPlaceholder('Enter location')
      .setLabel('Location')
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(locationInput),
    );

    await interaction.showModal(modal);

    logging.info('WEATHER INFO: Sent modal');
  },
};

export default button;
