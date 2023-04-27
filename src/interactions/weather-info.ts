import type {
  ButtonInteraction,
  ModalActionRowComponentBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import { findWeather } from '../utils/msn-weather';

export async function weatherInfoModalResponse(interaction: ModalSubmitInteraction) {
  // get string location
  const location = interaction.fields.getTextInputValue('location');

  // get weather information
  const weather = await findWeather({
    search: location,
  });

  // get first weather item
  const weatherItem = weather[0];

  if (!weatherItem.current || !weatherItem.forecast) return;

  const embed = new EmbedBuilder();
  embed.setTitle(`Weather Information for ${weatherItem.location.name}`);
  embed.setThumbnail(weatherItem.current.imageUrl);
  embed.setDescription(
    `Datetime: \`${weatherItem.current.date} ${weatherItem.current.observationtime}\` (${weatherItem.forecast[0].day})})`,
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
}

export async function weatherInfoButton(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('WEATHER_DASHBOARD-INFO_MODAL')
    .setTitle('Weather Information');

  const locationInput = new TextInputBuilder()
    .setCustomId('location')
    .setPlaceholder('Enter location')
    .setLabel('Location')
    .setStyle(TextInputStyle.Short);

  modal.addComponents(
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(locationInput),
  );

  await interaction.showModal(modal);
}
