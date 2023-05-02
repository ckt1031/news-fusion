import type { MessageActionRowComponentBuilder } from 'discord.js';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import type { InteractionHandlers } from '../../sturctures/interactions';
import logging from '../../utils/logger';

const command: InteractionHandlers = {
  type: 'command',
  data: new SlashCommandBuilder().setName('dashboard').setDescription('Show the admin dashboard'),
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
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

    logging.info('WEATHER INFO: Sent modal');

    const embed = new EmbedBuilder();
    embed.setTitle('Admin Dashboard');
    embed.setDescription('This is the admin dashboard, click the buttons below to perform actions');

    const shirkDatabaseButton = new ButtonBuilder()
      .setCustomId('shirk-database')
      .setLabel('Shirk Database')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      shirkDatabaseButton,
    );

    await interaction.reply({
      ephemeral: true,
      embeds: [embed],
      components: [row],
    });
  },
};

export default command;
