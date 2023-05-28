import { ButtonCustomIds } from '../../../sturctures/custom-id';
import type { InteractionHandlers } from '../../../sturctures/interactions';
import { defaultCache } from '../../../utils/cache';
import { updateEmbed } from '../../menus/display-rss-panel';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.ListRssSourcePanelNextPage,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    const currentPage = defaultCache.get<number>(interaction.message.id) ?? 0;

    defaultCache.set(interaction.message.id, currentPage + 1);

    await updateEmbed({
      interaction,
    });
  },
};

export default button;
