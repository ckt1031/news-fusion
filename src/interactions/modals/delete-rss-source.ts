import { DeleteRssSourceModelFieldIds, ModalCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import { RssSourcesCache } from '@/utils/rss/cache';

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.DeleteRssSource,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const serverId = interaction.guildId;
    const name = interaction.fields.getTextInputValue(DeleteRssSourceModelFieldIds.Name);
    const tagName = interaction.fields.getTextInputValue(DeleteRssSourceModelFieldIds.TagName);

    if (!serverId) return;

    const sourceCache = new RssSourcesCache();

    // If the sourceURL and serverId combination already exists, edit the existing tag
    const existingSource = await sourceCache.getSingleSource(serverId, tagName, name);

    if (!existingSource) {
      await interaction.reply({
        content: `Source \`${name}\` does not exist`,
        ephemeral: true,
      });

      return;
    }

    await sourceCache.removeSource(serverId, tagName, name);

    await interaction.deferUpdate();
  },
};

export default button;
