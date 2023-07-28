import type { Interaction } from 'discord.js';
import { Events } from 'discord.js';

import type { DiscordEvent } from '@/sturctures/event';
import logger from '@/utils/logger';

function getInteractionType(interaction: Interaction) {
  if (interaction.isButton()) {
    return 'button';
  } else if (interaction.isModalSubmit()) {
    return 'modal';
  } else if (interaction.isCommand()) {
    return 'command';
  } else if (interaction.isAnySelectMenu()) {
    return 'menu';
  } else {
    return 'unknown';
  }
}

export const event: DiscordEvent = {
  once: false,
  name: Events.InteractionCreate,
  run: async (interaction: Interaction) => {
    const type = getInteractionType(interaction);

    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isAnySelectMenu()) {
      const interactionHandler = interaction.client.interactions;

      const customId = `${type}-${interaction.customId}`;

      const handler = interactionHandler.get(customId);

      if (!handler) {
        logger.error(`Interaction handler not found: ${customId}`);

        return;
      }

      try {
        return handler.run({ interaction });
      } catch (error) {
        if (error instanceof Error) logger.error(error);
      }
    } else if (interaction.isCommand()) {
      const interactionHandler = interaction.client.interactions;

      const customId = `${type}-${interaction.commandName}`;

      const handler = interactionHandler.get(customId);

      if (!handler || handler.type !== 'command') {
        logger.error(`Interaction handler not found: ${customId}`);

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
