import { Collection } from 'discord.js';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

import { loadDiscordEvent } from './loaders/event';
import { loadButtons } from './loaders/interaction';
import type { InteractionHandlers } from './sturctures/interactions';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
  partials: [Partials.User, Partials.Channel, Partials.Message, Partials.GuildMember],
});

client.interactions = new Collection();

await loadDiscordEvent(client);
await loadButtons(client);

await client.login(process.env.TOKEN);

// declare types.
declare module 'discord.js' {
  export interface Client {
    interactions: Collection<string, InteractionHandlers>;
  }
}

export { client };
