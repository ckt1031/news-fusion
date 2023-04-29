import type { Interaction } from 'discord.js';
import { Events } from 'discord.js';

import type { DiscordEvent } from '../sturctures/event';
import logging from '../utils/logger';

function getInteractionType(interaction: Interaction) {
  if (interaction.isButton()) {
    return 'button';
  } else if (interaction.isModalSubmit()) {
    return 'modal';
  } else {
    return 'unknown';
  }
}

export const event: DiscordEvent = {
  once: false,
  name: Events.InteractionCreate,
  run: async (interaction: Interaction) => {
    const type = getInteractionType(interaction);

    const interactionHandler = interaction.client.interactions;

    if (interaction.isButton() || interaction.isModalSubmit()) {
      const customId = `${type}-${interaction.customId}`;

      const handler = interactionHandler.get(customId);

      if (!handler) {
        logging.error(`Interaction handler not found: ${customId}`);

        return;
      }

      try {
        return handler.run({ interaction });
      } catch (error) {
        if (error instanceof Error) console.error(error);
      }
    }

    // // If the interaction is a modal.
    // if (interaction.isModalSubmit()) {
    //   // eslint-disable-next-line sonarjs/no-small-switch
    //   switch (interaction.customId) {
    //     case 'WEATHER_DASHBOARD-INFO_MODAL': {
    //       await weatherInfoModalResponse(interaction);
    //       break;
    //     }
    //   }
    // } else if (interaction.isButton()) {
    //   switch (interaction.customId) {
    //     case 'translate_rss_notification': {
    //       await returnTranslatedButton(interaction);
    //       break;
    //     }
    //     case 'summarize_rss_news': {
    //       await summarizeNewsButton(interaction);
    //       break;
    //     }
    //     case 'weatherdashboard-show_info': {
    //       await weatherInfoButton(interaction);
    //       break;
    //     }
    //     default: {
    //       logging.error(`Unknown button ID: ${interaction.customId}`);

    //       await interaction.reply({
    //         content: 'Unknown button ID 🤔',
    //         ephemeral: true,
    //       });
    //       break;
    //     }
    //   }
    // }
  },
};
