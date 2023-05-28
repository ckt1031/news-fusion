import RssFeedSources from '../../models/RssFeedSources';
import { DeleteRssSourceModelFieldIds, ModalCustomIds } from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.DeleteRssSource,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const serverId = interaction.guildId;
    const name = interaction.fields.getTextInputValue(DeleteRssSourceModelFieldIds.Name);

    // If the sourceURL and serverId combination already exists, edit the existing tag
    const existingSource = await RssFeedSources.findOne({ name, serverId });

    if (!existingSource) {
      await interaction.reply({
        content: `Source \`${name}\` does not exist`,
        ephemeral: true,
      });

      return;
    }

    await RssFeedSources.findOneAndDelete({ name, serverId }).exec();

    await interaction.deferUpdate();
  },
};

export default button;
