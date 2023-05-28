import RssFeedSources from '../../models/RssFeedSources';
import RssFeedTag from '../../models/RssFeedTags';
import { CreateRssSourceModelFieldIds, ModalCustomIds } from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.CreateRssSource,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const serverId = interaction.guildId;
    const name = interaction.fields.getTextInputValue(CreateRssSourceModelFieldIds.Name);
    const sourceURL = interaction.fields.getTextInputValue(CreateRssSourceModelFieldIds.SourceUrl);
    const mentionRoleId = interaction.fields.getTextInputValue(
      CreateRssSourceModelFieldIds.MentionRoleId,
    );
    const enableMentionRole =
      interaction.fields.getTextInputValue(CreateRssSourceModelFieldIds.EnableRoleMention) ===
      'true';
    const tagName = interaction.fields.getTextInputValue(CreateRssSourceModelFieldIds.TagName);

    const tag = await RssFeedTag.findOne({ name: tagName, serverId });

    if (!tag) {
      await interaction.reply({
        content: `Tag \`${tagName}\` does not exist`,
        ephemeral: true,
      });

      return;
    }

    // If the sourceURL and serverId combination already exists, edit the existing tag
    const existingSource = await RssFeedSources.findOne({ name, serverId });

    if (existingSource) {
      existingSource.enableMentionRole = enableMentionRole;
      existingSource.tag = tag;
      existingSource.mentionRoleId = mentionRoleId;

      await existingSource.save();

      await interaction.deferUpdate();

      return;
    }

    await RssFeedSources.create({
      name,
      serverId,
      sourceURL,
      enableMentionRole,
      mentionRoleId,
      tag: tag._id,
    });

    await interaction.deferUpdate();
  },
};

export default button;
