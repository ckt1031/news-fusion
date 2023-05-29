import { DeleteRssSourceTagModelFieldIds, ModalCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import { RssSourcesCache } from '@/utils/rss/cache';

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.DeleteRssSourceTag,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const name = interaction.fields.getTextInputValue(DeleteRssSourceTagModelFieldIds.Name);
    const deleteSources = interaction.fields.getTextInputValue(
      DeleteRssSourceTagModelFieldIds.DeleteAllSources,
    );
    const serverId = interaction.guildId;

    if (!serverId) return;

    const sourceCache = new RssSourcesCache();

    // Check if the tag exists
    const tag = await sourceCache.getSingleTag(serverId, name);

    if (!tag) {
      await interaction.reply({
        content: `Tag \`${name}\` does not exist`,
        ephemeral: true,
      });

      return;
    }

    const sources = await sourceCache.getSources(serverId, tag.name);

    if (sources && sources.length > 0 && deleteSources === 'false') {
      await interaction.reply({
        content: `Tag \`${name}\` is still in use by ${sources.length} source(s)`,
        ephemeral: true,
      });

      return;
    }

    if (sources && sources.length > 0 && deleteSources === 'true') {
      await sourceCache.removeAllSources(serverId, tag.name);
    }

    // Delete the tag
    await sourceCache.removeTag(serverId, tag.name);

    await interaction.deferUpdate();
  },
};

export default button;
