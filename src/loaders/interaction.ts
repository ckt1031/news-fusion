import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Client, ClientEvents } from 'discord.js';
import { glob } from 'glob';

import type { InteractionHandlers } from '../sturctures/interactions';
import logger from '../utils/logger';

/** Discord Client events */
export interface DiscordEvent {
  // Event Data
  name: keyof ClientEvents;
  once?: boolean;
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
  run: (...arguments_: any[]) => Promise<void> | void;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadButtons(client: Client) {
  let folderPath = join(__dirname, '../interactions/**/*.{js,ts}');

  // Parse path in windows
  if (process.platform === 'win32') {
    folderPath = folderPath.replaceAll('\\', '/');
  }

  const allFiles = await glob(folderPath);

  if (allFiles.length === 0) {
    logger.error('No interactions found.');
    return;
  }

  for (const filePath of allFiles) {
    // Get event content.
    const interaction: InteractionHandlers = (await import(filePath)).default;

    console.log(`${interaction.type}-${interaction.customId}`);

    client.interactions.set(`${interaction.type}-${interaction.customId}`, interaction);
  }

  // Print number of loaded events.
  logger.debug(`Loaded ${allFiles.length} interactions.`);
}
