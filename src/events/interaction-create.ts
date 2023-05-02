import type { Interaction } from 'discord.js';
import { Events } from 'discord.js';

import type { DiscordEvent } from '../sturctures/event';
import logging from '../utils/logger';
import logger from '../utils/logger';

function getInteractionType(interaction: Interaction) {
  if (interaction.isButton()) {
    return 'button';
  } else if (interaction.isModalSubmit()) {
    return 'modal';
  } else if (interaction.isCommand()) {
    return 'command';
  } else {
    throw new Error('Unknown interaction type.');
  }
}

export const event: DiscordEvent = {
  once: false,
  name: Events.InteractionCreate,
  run: async (interaction: Interaction) => {
    const type = getInteractionType(interaction);

    if (interaction.isButton() || interaction.isModalSubmit()) {
      const interactionHandler = interaction.client.interactions;

      const customId = `${type}-${interaction.customId}`;

      const handler = interactionHandler.get(customId);

      if (!handler) {
        logging.error(`Interaction handler not found: ${customId}`);

        return;
      }

      try {
        return handler.run({ interaction });
      } catch (error) {
        if (error instanceof Error) logger.error(error);
      }
    } else if (interaction.isCommand()) {
      const interactionHandler = interaction.client.interactions;

      const command = interaction.command;

      if (!command) {
        logging.error(`Interaction command not found: ${interaction.commandName}`);
        return;
      }

      const customId = `command-${interaction.command.name}`;

      const handler = interactionHandler.get(customId);

      if (!handler) {
        logging.error(`Interaction handler not found: ${customId}`);

        return;
      }

      try {
        return handler.run({ interaction });
      } catch (error) {
        if (error instanceof Error) logger.error(error);
      }
    }
  },
};
