import { EmbedBuilder } from 'discord.js';

import type { InteractionHandlers } from '../../sturctures/interactions';
import logger from '../../utils/logger';
import { findWeather } from '../../utils/msn-weather';

const modal: InteractionHandlers = {
  type: 'modal',
  customId: 'WEATHER_DASHBOARD-INFO_MODAL',
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    // get string location
    const location = interaction.fields.getTextInputValue('location');

    // get weather information
    const weather = await findWeather({
      search: location,
    });

    logger.info(`WEATHER INFO: Searched for ${location} and got ${weather.length} results`);

    // get first weather item
    const weatherItem = weather[0];

    if (!weatherItem.current || !weatherItem.forecast) return;

    const embed = new EmbedBuilder();
    embed.setTitle(`Weather Information for ${weatherItem.location.name}`);
    embed.setThumbnail(weatherItem.current.imageUrl);
    embed.setDescription(
      `Datetime: \`${weatherItem.current.date} ${weatherItem.current.observationtime}\` (${weatherItem.forecast[0].day})`,
    );
    embed.addFields([
      {
        name: 'Temperature',
        value: `${weatherItem.forecast[0].high}°${weatherItem.location.degreetype} / ${weatherItem.forecast[0].low}°${weatherItem.location.degreetype}`,
        inline: true,
      },
      {
        name: 'Feels Like',
        value: `${weatherItem.current.feelslike}°${weatherItem.location.degreetype}`,
        inline: true,
      },
      {
        name: 'Humidity',
        value: weatherItem.current.humidity,
        inline: true,
      },
      {
        name: 'Wind',
        value: weatherItem.current.winddisplay,
        inline: true,
      },
      {
        name: 'Condition',
        value: weatherItem.current.skytext,
        inline: true,
      },
    ]);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};

export default modal;
