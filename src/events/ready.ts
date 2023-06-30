import Cron from 'croner';
import type { Client } from 'discord.js';
import { ActivityType, Events } from 'discord.js';

import type { DiscordEvent } from '@/sturctures/event';
import logging from '@/utils/logger';
import { checkFeeds } from '@/utils/rss/checking';
import shirkDatabase from '@/utils/shirk-database';

function setDiscordStatus(client: Client) {
  const text = 'Life';

  // Watch $TEXT
  client.user?.setActivity(text, {
    type: ActivityType.Watching,
  });
}

export const event: DiscordEvent = {
  once: true,
  name: Events.ClientReady,
  run: (client: Client) => {
    if (client.user) logging.info(`BOT: Logged in as ${client.user.tag}!`);

    setDiscordStatus(client);

    // recheck every 5 minutes
    Cron(
      '*/5 * * * *',
      {
        timezone: 'Asia/Hong_Kong',
      },
      async () => {
        await checkFeeds(client);
      },
    );

    // recheck every 15 minutes
    Cron(
      '*/15 * * * *',
      {
        timezone: 'Asia/Hong_Kong',
      },
      () => {
        setDiscordStatus(client);
      },
    );

    // recheck every 30 minutes
    Cron(
      '*/30 * * * *',
      {
        timezone: 'Asia/Hong_Kong',
      },
      async () => {
        await shirkDatabase();
      },
    );
  },
};
