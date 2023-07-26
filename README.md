# RSS News Bot

A Discord Bot which simplifies life, RSS feed, AI summarizer, and more!

## Features

### RSS Feed

- **⌚Autp RSS Checker**: The bot checks the RSS feed for new posts **every 10 minutes**. If there are new posts, the bot will send a message to the channel specified in the server config.
- **🧠AI Powered Summarizer**: The bot uses an AI (New Bing Reversed Engineering) to summarize the RSS feed. This allows the bot to summarize the RSS feed and send the summary to the user via direct message.
- **⭐Starboard**: The bot uses a starboard to store starred messages. This allows the bot to store starred messages and send them to the starboard channel.

### Bot

- **🗄️Caching**: The bot includes a caching mechanism to improve performance and reduce the need for repeated API requests. It caches data such as RSS feed entries and summarized content, allowing for faster retrieval and reduced load on external services.
- **🌐Multi-Server Support**: The bot is capable of running on multiple servers simultaneously. It can be configured to work with settings on each server.
- **↙️Slash Commands**: The bot uses Discord's slash commands to provide a simple and intuitive interface for users to interact with the bot.
- **🔋MongoDB Database**: The bot uses **MongoDB** to store data. This allows the bot to store data persistently and allows for easy retrieval of data.
- **⚠️Error Reporting**: The bot uses **Sentry** to report errors. This allows the bot to report errors to Sentry, which can then be used to debug the bot.
- **🛡️TypeScript**: The bot is written in TypeScript. This allows for type checking and better code quality.

## Setup and Installation

To set up and install the RSS News Discord bot, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/your-username/rss-news-bot.git
   ```

2. Navigate to the project directory:

   ```shell
   cd rss-news-bot
   ```

3. Install the dependencies using npm:

   ```shell
   npm install
   ```

4. Build the TypeScript code into a JavaScript file:

   ```shell
   npm run build
   ```

5. Start the bot:

   ```shell
   npm start
   ```

Make sure to populate the necessary environment variables in the .env file before starting the bot. Refer to the [Environment Variables](#environment-variables) section for more details.

## Environment Variables

The following environment variables are required to run the RSS News Discord bot:

- `TOKEN`: Discord bot token. This is the token provided by Discord for your bot.
- `SENTRY_DSN`: Sentry DSN (Data Source Name) for error reporting. This is used to send error reports to Sentry.
- `MONGODB_URL`: **MongoDB URL** for database connection. Provide the URL for your MongoDB database.
- `CLIENT_ID`: Discord client ID for slash commands. This ID is obtained when you register your bot application on the Discord Developer Portal.
- `OWNER_USER_ID`: Discord bot owner's user ID. This ID identifies the user who owns the bot.
- `OWNER_GUILD_ID`: Discord owner's guild ID. This ID identifies the guild (server) where the bot owner is a member.

## Screenshots

- **Server Config**

  ![Screenshot 1](https://i.ibb.co/pX14nVX/image.png)
  ![Screenshot 2](https://i.ibb.co/frz42rG/image.png)

### RSS Feed

- **RSS Feed Config**

  ![Screenshot 3](https://i.ibb.co/yPZYhVS/image.png)

- **RSS Sources Listing (With Pagination)**

  ![Screenshot 4](https://i.ibb.co/WFGgJkd/image.png)

- **RSS Feed AI Summarizing Modal**

  ![Screenshot 5](https://i.ibb.co/bWFGd1V/image.png)

- **RSS Feed AI Summarizing Result (Direct Message)**

  ![Screenshot 6](https://i.ibb.co/2gqPpn1/image.png)

## License

Project is licensed under the [MIT License](LICENSE).
