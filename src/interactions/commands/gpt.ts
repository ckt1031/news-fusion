import { SlashCommandBuilder } from 'discord.js';

import type { InteractionHandlers } from '@/sturctures/interactions';
import { getBingResponse } from '@/utils/bing-ai';

const command: InteractionHandlers = {
  type: 'command',
  data: new SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Ask AI to generate text or solve problems for you')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('The prompt you want to ask the AI')
        .setRequired(true),
    ),
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isCommand()) {
      return;
    }

    // Check if the user is the owner of this bot.
    if (process.env.OWNER_USER_ID !== interaction.user.id) {
      await interaction.reply({
        ephemeral: true,
        content: 'You are not the owner of this bot.',
      });
      return;
    }

    const prompt = interaction.options.get('prompt')?.value;

    if (!prompt || typeof prompt !== 'string') {
      await interaction.reply({
        ephemeral: true,
        content: 'Please provide the model and prompt.',
      });
      return;
    }

    await interaction.deferReply({
      ephemeral: false,
    });

    const reply = await getBingResponse('Precise', prompt);

    await interaction.followUp({
      content: reply,
    });
  },
};

export default command;
