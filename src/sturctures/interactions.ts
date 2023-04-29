import type { Interaction } from 'discord.js';

export interface InteractionHandlers {
  type: 'button' | 'modal';
  customId: string;

  // eslint-disable-next-line no-unused-vars
  run: ({ interaction }: { interaction: Interaction }) => Promise<void>;
}
