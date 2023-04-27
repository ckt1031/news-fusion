import type { Client, MessageActionRowComponentBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export async function weatherDashboardMessage(client: Client) {
  // This embed includes a button and embed dashboard of weather information.
  const embed = new EmbedBuilder();

  embed.setTitle('🌦️ Weather Dashboard');
  embed.setDescription('Click the button below to get weather information.');
  embed.setFooter({
    text: 'Powered by MSN Weather',
    iconURL:
      'https://cdn.discordapp.com/attachments/1086557172147699742/1101150300884185118/Microsoft_icon.svg.png',
  });
  embed.setImage(
    // A weather relvant image.
    'https://cdn.discordapp.com/attachments/1086557172147699742/1101149423351910520/sky-clouds-west-pink.jpg',
  );

  const infoButton = new ButtonBuilder()
    .setCustomId('weatherdashboard-show_info')
    .setLabel('Display Information')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(infoButton);

  const channel = client.channels.cache.get('1100745249070010448');

  if (!channel?.isTextBased()) return;

  await channel.send({
    embeds: [embed],
    components: [row],
  });
}
