import { SlashCommandBuilder } from 'discord.js';

import { getBingResponse } from '../../ai/edge-gpt';
import { getQuoraResponse } from '../../ai/quora';
import type { InteractionHandlers } from '../../sturctures/interactions';

const command: InteractionHandlers = {
  type: 'command',
  data: new SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Ask AI to generate text or solve problems for you')
    .addStringOption(option =>
      option
        .setName('model')
        .setDescription('The model for the AI')
        .setRequired(true)
        .addChoices({ name: 'Bing AI', value: 'bing' }, { name: 'Poe.com', value: 'quora' }),
    )
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
    if (process.env.OWNER_ID !== interaction.user.id) {
      await interaction.reply({
        ephemeral: true,
        content: 'You are not the owner of this bot.',
      });
      return;
    }

    const model = interaction.options.get('model')?.value;
    const prompt = interaction.options.get('prompt')?.value;

    if (!model || !prompt || typeof model !== 'string' || typeof prompt !== 'string') {
      await interaction.reply({
        ephemeral: true,
        content: 'Please provide the model and prompt.',
      });
      return;
    }

    await interaction.deferReply({
      ephemeral: false,
    });

    let reply = '';

    if (model === 'bing') {
      reply = await getBingResponse('precise', prompt);
    } else if (model === 'poe') {
      reply = await getQuoraResponse(prompt);
    }

    await interaction.followUp({
      content: reply,
    });
  },
};

export default command;
