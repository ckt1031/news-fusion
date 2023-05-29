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

export interface MenuInteractionHandlers {
  type: 'menu';
  customId: string;
  run: ({ interaction }: { interaction: Interaction }) => Promise<void>;
}

export interface CommandInteractionHandlers {
  type: 'command';
  isGlobal: boolean;
  data: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  run: ({ interaction }: { interaction: Interaction }) => Promise<void>;
}

export type InteractionHandlers =
  | ButtonInteractionHandlers
  | ModalInteractionHandlers
  | CommandInteractionHandlers
  | MenuInteractionHandlers;
