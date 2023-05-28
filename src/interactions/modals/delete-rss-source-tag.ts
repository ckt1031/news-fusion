import RssFeedSources from '../../models/RssFeedSources';
import RssFeedTag from '../../models/RssFeedTags';
import { DeleteRssSourceTagModelFieldIds, ModalCustomIds } from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.DeleteRssSourceTag,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const name = interaction.fields.getTextInputValue(DeleteRssSourceTagModelFieldIds.Name);
    const serverId = interaction.guildId;

    // If the name and serverId combination already exists, edit the existing tag
    const existingTag = await RssFeedTag.findOne({ name, serverId });

    if (!existingTag) {
      await interaction.reply({
        content: `Tag \`${name}\` does not exist`,
        ephemeral: true,
      });

      return;
    }

    // Check if there are any sources that use this tag
    const sources = await RssFeedSources.find({ tag: existingTag._id, serverId });

    if (sources.length > 0) {
      await interaction.reply({
        content: `Tag \`${name}\` is still in use by ${sources.length} source(s)`,
        ephemeral: true,
      });

      return;
    }

    await RssFeedTag.findOneAndDelete({ name, serverId }).exec();

    await interaction.deferUpdate();
  },
};

export default button;
