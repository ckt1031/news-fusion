import type { MessageActionRowComponentBuilder } from 'discord.js';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import { ButtonCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';

const command: InteractionHandlers = {
  type: 'command',
  isGlobal: true,
  data: new SlashCommandBuilder().setName('config').setDescription('Manage server config'),
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isCommand()) {
      return;
    }

    if (!interaction.guild) {
      await interaction.reply({
        ephemeral: true,
        content: 'This command can only be used in a server.',
      });
      return;
    }

    // Check if the user is server admin.
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        ephemeral: true,
        content: 'You are not a server admin.',
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Server Config')
      .setDescription('This is the server config, click the buttons below to perform actions');

    const configButton = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.ManageServerConfig)
      .setLabel('Manage Server Config')
      .setStyle(ButtonStyle.Primary);

    const rssPanelButton = new ButtonBuilder()
      .setCustomId(ButtonCustomIds.RssSourcePanel)
      .setLabel('Manage RSS Sources')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      configButton,
      rssPanelButton,
    );

    await interaction.reply({
      ephemeral: true,
      embeds: [embed],
      components: [row],
    });
  },
};

export default command;
