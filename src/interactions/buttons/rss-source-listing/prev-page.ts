import { updateEmbed } from '@/interactions/menus/display-rss-panel';
import { ButtonCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import { defaultCache } from '@/utils/cache';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.ListRssSourcePanelPreviuousPage,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const currentPage = defaultCache.get<number>(interaction.message.id) ?? 0;

    defaultCache.set(interaction.message.id, currentPage - 1);

    await updateEmbed({
      interaction,
    });
  },
};

export default button;
