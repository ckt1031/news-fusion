import dayjs from 'dayjs';
import { EmbedBuilder, version as discordJsVersion } from 'discord.js';
import pidusage from 'pidusage';
import sAgo from 's-ago';

import type { InteractionHandlers } from '../../sturctures/interactions';

const button: InteractionHandlers = {
  type: 'button',
  customId: 'bot-info',
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const apiDelayMS = Math.round(interaction.client.ws.ping);
    const osStats = await pidusage(process.pid);

    const embed = new EmbedBuilder()
      .setTitle("Bot's Information")
      .setDescription(
        'Hello! I am Draconian Bot, honored to see you here. Information below is my body analysis :)',
      )
      .addFields([
        {
          name: 'Discord.js',
          value: `\`${discordJsVersion}\``,
          inline: true,
        },
        {
          name: 'Node',
          value: `\`${process.version}\``,
          inline: true,
        },
        {
          name: 'CPU',
          value: `\`${Math.round(Number(osStats.cpu.toFixed(2)))}%\``,
          inline: true,
        },
        {
          name: 'Memory',
          value: `\`${Math.round(osStats.memory / (1024 * 1024))}MB\``,
          inline: true,
        },
        {
          name: 'Uptime',
          value: `\`${sAgo(dayjs().subtract(process.uptime(), 'second').toDate())}\``,
          inline: true,
        },
        {
          name: 'Network Delay',
          value: `\`${apiDelayMS} ms\``,
          inline: true,
        },
      ]);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};

export default button;
