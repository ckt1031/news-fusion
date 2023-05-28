import type { Interaction, MessageActionRowComponentBuilder } from 'discord.js';
import { ButtonStyle } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

import RssFeedSources, { type RssFeedSource } from '../../models/RssFeedSources';
import type { RssFeedTag } from '../../models/RssFeedTags';
import RssFeedTags from '../../models/RssFeedTags';
import { ButtonCustomIds, MenuCustomIds } from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';
import { defaultCache } from '../../utils/cache';

interface UpdateEmbedOptions {
  interaction: Interaction;
}

export const updateEmbed = async ({ interaction }: UpdateEmbedOptions) => {
  if (!interaction.channel) return;

  // Reject if not button or menu
  if (!interaction.isButton() && !interaction.isAnySelectMenu()) return;

  const messageId = interaction.message.id;

  const itemsPerPage = 10;

  // use cache to store current page
  const currentPage = defaultCache.get<number>(messageId) ?? 0;
  const selectedTag = defaultCache.get<RssFeedTag>(`PANEL_RSS_SOURCES_TAG_${messageId}`);
  const rssFeedSources = defaultCache.get<RssFeedSource[]>(`PANEL_RSS_SOURCES_${messageId}`);

  if (!selectedTag || !rssFeedSources) return;

  const maxPage = Math.ceil(rssFeedSources.length / itemsPerPage) - 1;

  const embed = new EmbedBuilder();
  embed.setTitle(`RSS Sources for tag ${selectedTag.name}`);
  embed.setDescription(
    rssFeedSources
      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      .map((source, index) => {
        return `${index + 1 + currentPage * itemsPerPage}. ${source.name} - ${source.sourceURL}`;
      })
      .join('\n'),
  );

  // Add navigation buttons
  const prevButton = new ButtonBuilder()
    .setCustomId(ButtonCustomIds.ListRssSourcePanelPreviuousPage)
    .setLabel('Prev')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(currentPage === 0);
  const nextButton = new ButtonBuilder()
    .setCustomId(ButtonCustomIds.ListRssSourcePanelNextPage)
    .setLabel('Next')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(currentPage === maxPage);
  const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    prevButton,
    nextButton,
  );

  await interaction.update({
    embeds: [embed],
    components: [actionRow],
  });
};

const button: InteractionHandlers = {
  type: 'menu',
  customId: MenuCustomIds.DisplayRssSourcePanel,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isAnySelectMenu()) {
      return;
    }

    const selectedTagId = interaction.values[0];
    const selectedTag = await RssFeedTags.findById(selectedTagId);
    if (!selectedTag) return;

    // List all sources with selected tag
    const rssFeedSources = await RssFeedSources.find({
      serverId: interaction.guildId,
      tag: selectedTag._id,
    });

    // Return if no sources
    if (rssFeedSources.length === 0) {
      const embed = new EmbedBuilder();
      embed.setTitle(`RSS Sources for tag ${selectedTag.name}`);
      embed.setDescription('No sources found');
      await interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
      return;
    }

    // Save to cache
    defaultCache.set('PANEL_RSS_SOURCES_' + interaction.message.id, rssFeedSources, 15 * 60 * 1000); // 15 minutes
    defaultCache.set(
      'PANEL_RSS_SOURCES_TAG_' + interaction.message.id,
      selectedTag,
      15 * 60 * 1000,
    ); // 15 minutes

    await updateEmbed({
      interaction,
    });
  },
};

export default button;
