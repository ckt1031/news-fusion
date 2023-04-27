import Cron from 'croner';
import { ActivityType, Client, GatewayIntentBits, Partials } from 'discord.js';
import pino from 'pino';

import returnTranslatedButton from './buttons/return-translated-text';
import summarizeNewsButton from './buttons/summarize-news';
import checkRss from './utils/check-rss-feed';

const logger = pino();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
  partials: [Partials.User, Partials.Channel, Partials.Message, Partials.GuildMember],
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    switch (interaction.customId) {
      case 'translate_rss_notification': {
        await returnTranslatedButton(interaction);
        break;
      }
      case 'summarize_rss_news': {
        await summarizeNewsButton(interaction);
        break;
      }
      default: {
        logger.error(`Unknown button ID: ${interaction.customId}`);

        await interaction.reply({
          content: 'Unknown button ID 🤔',
          ephemeral: true,
        });
        break;
      }
    }
  }
});

function setDiscordStatus() {
  const text = 'Life';

  // Watch $TEXT
  client.user?.setActivity(text, {
    type: ActivityType.Watching,
  });
}

client.on('ready', async client => {
  logger.info(`Logged in as ${client.user.tag}!`);

  setDiscordStatus();
  await checkRss(client);

  // recheck every 3 minute
  Cron(
    '*/3 * * * *',
    {
      timezone: 'Asia/Hong_Kong',
    },
    async () => {
      await checkRss(client);
    },
  );

  // recheck every 10 minute
  Cron(
    '*/10 * * * *',
    {
      timezone: 'Asia/Hong_Kong',
    },
    () => {
      setDiscordStatus();
    },
  );
});

void client.login(process.env.TOKEN);
