import { join } from 'node:path';

import type {
  Client,
  ClientEvents,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { REST, Routes } from 'discord.js';
import { glob } from 'glob';

import { __dirname } from '@/constants';
import type { InteractionHandlers } from '@/sturctures/interactions';
import logger from '@/utils/logger';

/** Discord Client events */
export interface DiscordEvent {
  // Event Data
  name: keyof ClientEvents;
  once?: boolean;
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
  run: (...arguments_: any[]) => Promise<void> | void;
}

export async function loadInteractions(client: Client) {
  let folderPath = join(__dirname, '../dist/interactions/**/*.{js,ts}');

  // Parse path in windows
  if (process.platform === 'win32') {
    folderPath = folderPath.replaceAll('\\', '/');
  }

  const allFiles = await glob(folderPath);
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  if (allFiles.length === 0) {
    logger.error('No interactions found.');
    return;
  }

  for (const filePath of allFiles) {
    // Get event content.
    const interaction: InteractionHandlers = (await import(filePath)).default;

    // Check if the event is valid.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!interaction?.type) {
      logger.error(`Invalid interaction file: ${filePath}`);
      continue;
    }

    if (interaction.type === 'command') {
      client.interactions.set(`command-${interaction.data.name}`, interaction);
      commands.push(interaction.data.toJSON());
      continue;
    }

    client.interactions.set(`${interaction.type}-${interaction.customId}`, interaction);
  }

  if (commands.length > 0) {
    // Register interactions.
    const rest = new REST().setToken(process.env.TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.OWNER_GUILD_ID),
      {
        body: commands,
      },
    );
  }

  // Print number of loaded events.
  logger.info(`Loaded ${allFiles.length} interactions.`);
}
