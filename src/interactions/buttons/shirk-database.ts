import { ButtonCustomIds } from '../../sturctures/custom-id';
import type { InteractionHandlers } from '../../sturctures/interactions';
import shirkDatabase from '../../utils/shirk-database';

const button: InteractionHandlers = {
  type: 'button',
  customId: ButtonCustomIds.ShirkDatabase,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    // Check if the user is the owner of this bot.
    if (process.env.OWNER_USER_ID !== interaction.user.id) {
      await interaction.reply({
        ephemeral: true,
        content: 'You are not the owner of this bot.',
      });
      return;
    }

    await shirkDatabase();

    // Reply to the interaction.
    await interaction.reply({
      ephemeral: true,
      content: 'Done',
    });
  },
};

export default button;
