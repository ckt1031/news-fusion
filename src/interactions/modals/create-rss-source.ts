import normalizeUrl from 'normalize-url';

import { CreateRssSourceModelFieldIds, ModalCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import { RssSourcesCache } from '@/utils/rss/cache';

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.CreateRssSource,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const serverId = interaction.guildId;
    const name = interaction.fields.getTextInputValue(CreateRssSourceModelFieldIds.Name);
    const sourceURL = normalizeUrl(
      interaction.fields.getTextInputValue(CreateRssSourceModelFieldIds.SourceUrl),
    );
    const mentionRoleId = interaction.fields.getTextInputValue(
      CreateRssSourceModelFieldIds.MentionRoleId,
    );
    const enableMentionRole =
      interaction.fields.getTextInputValue(CreateRssSourceModelFieldIds.EnableRoleMention) ===
      'true';
    const tagName = interaction.fields.getTextInputValue(CreateRssSourceModelFieldIds.TagName);

    if (!serverId) return;

    const sourceCache = new RssSourcesCache();

    // Check if the tag exists
    const tag = await sourceCache.getSingleTag(serverId, tagName);

    if (!tag) {
      await interaction.reply({
        content: `Tag \`${tagName}\` does not exist`,
        ephemeral: true,
      });

      return;
    }

    // If the sourceURL and serverId combination already exists, edit the existing tag
    const existingSource = await sourceCache.getSingleSource(serverId, tagName, name);

    // eslint-disable-next-line unicorn/prefer-ternary
    if (existingSource) {
      await sourceCache.updateSource(serverId, tagName, name, {
        enableMentionRole,
        mentionRoleId,
        sourceURL,
      });
    } else {
      await sourceCache.addSource(serverId, tagName, {
        enableMentionRole,
        mentionRoleId,
        sourceURL,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        tag: tag._id,
      });
    }

    // Acknowledge the interaction
    await interaction.deferUpdate();
  },
};

export default button;
