import type { MessageActionRowComponentBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

import { ButtonCustomIds, MenuCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import { RssSourcesCache } from '@/utils/rss/cache';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.ListRssSource,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    // List all tags
    const serverId = interaction.guildId;

    if (!serverId) return;

    const cache = new RssSourcesCache();

    const rssFeedTags = await cache.getTags(serverId);

    const embed = new EmbedBuilder();
    embed.setTitle('RSS Source List');

    // Return if no tags
    if (!rssFeedTags || rssFeedTags.length === 0) {
      embed.setDescription('No tags found');
      await interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
      return;
    }

    // With Menu to choose which tag to view
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(MenuCustomIds.DisplayRssSourcePanel)
      .setPlaceholder('Select a tag')
      .addOptions(
        rssFeedTags.map(tag =>
          new StringSelectMenuOptionBuilder()
            .setLabel(tag.name)
            .setValue(tag.name)
            .setDescription(String(tag._id)),
        ),
      );

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      selectMenu,
    );

    await interaction.reply({
      ephemeral: true,
      embeds: [embed],
      components: [actionRow],
    });
  },
};

export default button;
