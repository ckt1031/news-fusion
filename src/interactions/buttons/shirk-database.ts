import rssFeedCheck from '../../models/rss-feed-check';
import type { InteractionHandlers } from '../../sturctures/interactions';
import logging from '../../utils/logger';

const button: InteractionHandlers = {
  type: 'button',
  customId: 'shirk-database',
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isButton()) {
      return;
    }

    // Check if the user is the owner of this bot.
    if (process.env.OWNER_ID !== interaction.user.id) {
      await interaction.reply({
        ephemeral: true,
        content: 'You are not the owner of this bot.',
      });
      return;
    }

    // Delete data which the field lastChecked (in ms) is older than 1 day.
    const deleteOlderThan = Date.now() - 1000 * 60 * 60 * 24;

    await rssFeedCheck.deleteMany({
      lastChecked: {
        $lt: deleteOlderThan,
      },
    });

    logging.info('Shirk database (RSS feed checks)');

    // Reply to the interaction.
    await interaction.reply({
      ephemeral: true,
      content: 'Done',
    });
  },
};

export default button;
