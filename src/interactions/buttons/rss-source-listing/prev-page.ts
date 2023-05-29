import { updateEmbed } from '@/interactions/menus/display-rss-panel';
import { ButtonCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import type { RssSourcePaginationCache } from '@/sturctures/rss-sources-pagination';
import { feedSourcePaginationCache } from '@/utils/cache';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.ListRssSourcePanelPreviuousPage,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const data = feedSourcePaginationCache.get<RssSourcePaginationCache>(interaction.message.id);

    if (!data) return;

    feedSourcePaginationCache.set(interaction.message.id, {
      ...data,
      currentPage: data.currentPage - 1,
    });

    await updateEmbed({
      interaction,
    });
  },
};

export default button;
