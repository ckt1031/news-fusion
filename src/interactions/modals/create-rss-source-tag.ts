import RssFeedTag from '@/models/RssFeedTags';
import { CreateRssSourceTagModelFieldIds, ModalCustomIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';

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

    // If the name and serverId combination already exists, edit the existing tag
    const existingTag = await RssFeedTag.findOne({ name, serverId });

    if (existingTag) {
      existingTag.sendToChannelId = sendToChannelId;

      await existingTag.save();

      await interaction.deferUpdate();

      return;
    }

    await RssFeedTag.create({
      name,
      serverId,
      sendToChannelId,
    });

    await interaction.deferUpdate();
  },
};

export default button;
