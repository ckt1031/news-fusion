import type { Interaction, MessageActionRowComponentBuilder } from 'discord.js';
import { ButtonStyle } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

import { ButtonCustomIds, MenuCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import type { RssSourcePaginationCache } from '@/sturctures/rss-sources-pagination';
import { feedSourcePaginationCache } from '@/utils/cache';
import { RssSourcesCache } from '@/utils/rss/cache';

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
  const data = feedSourcePaginationCache.get<RssSourcePaginationCache>(messageId);

  if (!data) return;

  const maxPage = Math.ceil(data.rssFeedSources.length / itemsPerPage) - 1;

  const embed = new EmbedBuilder();
  embed.setTitle(`RSS Sources for tag: ${data.selectedTag.name}`);
  embed.setDescription(
    data.rssFeedSources
      .slice(data.currentPage * itemsPerPage, (data.currentPage + 1) * itemsPerPage)
      .map((source, index) => {
        return `${index + 1 + data.currentPage * itemsPerPage}. **${source.name}** - ${
          source.sourceURL
        }`;
      })
      .join('\n'),
  );
  embed.setFooter({
    text: `Page ${data.currentPage + 1}/${maxPage + 1}`,
  });

  // Add navigation buttons
  const prevButton = new ButtonBuilder()
    .setCustomId(ButtonCustomIds.ListRssSourcePanelPreviuousPage)
    .setLabel('Prev')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(data.currentPage === 0);

  const nextButton = new ButtonBuilder()
    .setCustomId(ButtonCustomIds.ListRssSourcePanelNextPage)
    .setLabel('Next')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(data.currentPage === maxPage);

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
    if (!interaction.channel || !interaction.isAnySelectMenu() || !interaction.guildId) {
      return;
    }

    const cache = new RssSourcesCache();

    const selectedTagName = interaction.values[0];
    const selectedTag = await cache.getSingleTag(interaction.guildId, selectedTagName);
    if (!selectedTag) return;

    // List all sources with selected tag
    const rssFeedSources = await cache.getSources(interaction.guildId, selectedTag.name);

    if (!rssFeedSources) return;

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
    feedSourcePaginationCache.set(
      interaction.message.id,
      {
        currentPage: 0,
        rssFeedSources,
        selectedTag,
      },
      3 * 60,
    ); // 3 minute

    await updateEmbed({
      interaction,
    });
  },
};

export default button;
