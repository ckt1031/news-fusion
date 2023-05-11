import { join } from 'node:path';

import type { Client } from 'discord.js';
import { glob } from 'glob';

import { __dirname } from '../constants';
import type { DiscordEvent } from '../sturctures/event';
import logger from '../utils/logger';

export async function loadDiscordEvent(client: Client) {
  let folderPath = join(__dirname, '../dist/events/**/*.{js,ts}');

  // Parse path in windows
  if (process.platform === 'win32') {
    folderPath = folderPath.replaceAll('\\', '/');
  }

  const allFiles = await glob(folderPath);

  if (allFiles.length === 0) {
    logger.error('No events found.');
    return;
  }

  for (const filePath of allFiles) {
    // Get event content.
    const eventFile = await import(filePath);
    const event: DiscordEvent = eventFile.event;

    // Check triggering mode.
    if (event.once === true) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      client.once(event.name, event.run.bind(undefined));
    } else {
      // eslint-disable-next-line unicorn/no-useless-undefined
      client.on(event.name, event.run.bind(undefined));
    }
  }

  // Print number of loaded events.
  logger.info(`Loaded ${allFiles.length} Discord events.`);
}
