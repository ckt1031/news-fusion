import { CreateRssSourceTagModelFieldIds, ModalCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import { RssSourcesCache } from '@/utils/rss/cache';

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.CreateRssSourceTag,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const serverId = interaction.guildId;

    const name = interaction.fields.getTextInputValue(CreateRssSourceTagModelFieldIds.Name);
    const sendToChannelId = interaction.fields.getTextInputValue(
      CreateRssSourceTagModelFieldIds.SendToChannelId,
    );

    if (!serverId) return;

    const sourceCache = new RssSourcesCache();

    // If the name and serverId combination already exists, edit the existing tag
    const existingTag = await sourceCache.getSingleTag(serverId, name);

    // eslint-disable-next-line unicorn/prefer-ternary
    if (existingTag) {
      await sourceCache.addTag(serverId, {
        name,
        serverId,
        sendToChannelId,
      });
    } else {
      await sourceCache.updateTag(serverId, name, {
        sendToChannelId,
      });
    }

    await interaction.deferUpdate();
  },
};

export default button;
