import type { Interaction, SlashCommandBuilder } from 'discord.js';

export interface ButtonInteractionHandlers {
  type: 'button';
  customId: string;
  run: ({ interaction }: { interaction: Interaction }) => Promise<void>;
}

export interface ModalInteractionHandlers {
  type: 'modal';
  customId: string;
  run: ({ interaction }: { interaction: Interaction }) => Promise<void>;
}

export interface CommandInteractionHandlers {
  type: 'command';
  data: SlashCommandBuilder;
  run: ({ interaction }: { interaction: Interaction }) => Promise<void>;
}

export type InteractionHandlers =
  | ButtonInteractionHandlers
  | ModalInteractionHandlers
  | CommandInteractionHandlers;
