import Settings from '../../models/Settings';
import { ModalCustomIds, ServerConfigurationModelFieldIds } from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.ServerConfigurations,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const serverId = interaction.guildId;
    const rssStarboardChannelId = interaction.fields.getTextInputValue(
      ServerConfigurationModelFieldIds.RssStarboardChannelId,
    );
    const enableNewsSummarizing =
      interaction.fields.getTextInputValue(
        ServerConfigurationModelFieldIds.EnableNewsSummarizing,
      ) === 'true';
    const enableNewsTranslation =
      interaction.fields.getTextInputValue(
        ServerConfigurationModelFieldIds.EnableNewsTranslation,
      ) === 'true';
    const enableNewsStarboard =
      interaction.fields.getTextInputValue(ServerConfigurationModelFieldIds.EnableNewsStarboard) ===
      'true';

    // If the serverId already exists, edit the existing settings
    const existingData = await Settings.findOne({ serverId });

    if (existingData) {
      existingData.rssStarboardChannelId = rssStarboardChannelId;
      existingData.enableNewsSummarizing = enableNewsSummarizing;
      existingData.enableNewsTranslation = enableNewsTranslation;
      existingData.enableNewsStarboard = enableNewsStarboard;

      await existingData.save();

      await interaction.deferUpdate();

      return;
    }

    await Settings.create({
      serverId,
      rssStarboardChannelId,
      enableNewsSummarizing,
      enableNewsTranslation,
      enableNewsStarboard,
    });

    await interaction.deferUpdate();
  },
};

export default button;
