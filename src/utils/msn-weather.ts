import axios from 'axios';
import xml2js from 'xml2js';

import logger from './logger';

interface WeatherLocation {
  name: string;
  zipcode: string;
  lat: string;
  long: string;
  timezone: string;
  alert: string;
  degreetype: string;
  imagerelativeurl: string;
}

interface CurrentWeather {
  observationtime: string;
  temperature: string;
  skytext: string;
  humidity: string;
  winddisplay: string;
  imageUrl: string;
  date: string;
  feelslike: string;
  observationpoint: string;
  uvindex: string;
}

interface ForecastWeather {
  low: string;
  high: string;
  skycodeday: string;
  skytextday: string;
  date: string;
  day: string;
  shortday: string;
  precip: string;
  weekday: string;
}

interface WeatherItem {
  location: WeatherLocation;
  current: CurrentWeather | null;
  forecast: ForecastWeather[] | null;
}

interface WeatherOptions {
  search: string;
  lang?: string;
  degreeType?: string;
  timeout?: number;
}

const findUrl = 'http://weather.service.msn.com/find.aspx';
const defLang = 'en-US';
const defDegreeType = 'C';
const defTimeout = 10_000;

export const findWeather = async (options: WeatherOptions): Promise<WeatherItem[]> => {
  const lang = options.lang ?? defLang;
  const degreeType = options.degreeType ?? defDegreeType;
  const timeout = options.timeout ?? defTimeout;
  const search = encodeURIComponent(options.search);

  const reqUrl = `${findUrl}?src=outlook&weadegreetype=${degreeType}&culture=${lang}&weasearchstr=${search}`;

  try {
    const response = await axios.get(reqUrl, { timeout });
    const body = response.data;

    if (body.indexOf('<') !== 0) {
      if (body.search(/not found/i) !== -1) {
        return [];
      }
      throw new Error('Invalid body content');
    }

    const resultJSON = await xml2js.parseStringPromise(body, {
      charkey: 'C$',
      attrkey: 'A$',
      explicitArray: true,
    });

    if (!resultJSON?.weatherdata?.weather) {
      throw new Error('Failed to parse weather data');
    }

    if (resultJSON.weatherdata.weather.A$?.errormessage) {
      throw new Error(resultJSON.weatherdata.weather.A$.errormessage);
    }

    const weatherItems: WeatherItem[] = [];

    for (const weather of resultJSON.weatherdata.weather) {
      if (!weather.A$ || typeof weather.A$ !== 'object') {
        continue;
      }

      const weatherItem: WeatherItem = {
        location: {
          name: weather.A$.weatherlocationname,
          zipcode: weather.A$.zipcode,
          lat: weather.A$.lat,
          long: weather.A$.long,
          timezone: weather.A$.timezone,
          alert: weather.A$.alert,
          degreetype: weather.A$.degreetype,
          imagerelativeurl: weather.A$.imagerelativeurl,
        },
        current: null,
        forecast: null,
      };

      if (Array.isArray(weather.current) && weather.current.length > 0) {
        const currentWeather = weather.current[0].A$;
        if (currentWeather && typeof currentWeather === 'object') {
          weatherItem.current = {
            observationtime: currentWeather.observationtime,
            temperature: currentWeather.temperature,
            skytext: currentWeather.skytext,
            humidity: currentWeather.humidity,
            winddisplay: currentWeather.winddisplay,
            date: currentWeather.date,
            imageUrl: `${weatherItem.location.imagerelativeurl}law/${currentWeather.skycode}.gif`,
            feelslike: currentWeather.feelslike,
            observationpoint: currentWeather.observationpoint,
            uvindex: currentWeather.uvindex,
          };
        }
      }

      if (Array.isArray(weather.forecast)) {
        const forecastWeather: ForecastWeather[] = [];
        for (const forecast of weather.forecast) {
          if (forecast && typeof forecast.A$ === 'object') {
            forecastWeather.push({
              low: forecast.A$.low,
              high: forecast.A$.high,
              skycodeday: forecast.A$.skycodeday,
              skytextday: forecast.A$.skytextday,
              date: forecast.A$.date,
              day: forecast.A$.day,
              shortday: forecast.A$.shortday,
              precip: forecast.A$.precip,
              weekday: forecast.A$.weekday,
            });
          }
        }
        weatherItem.forecast = forecastWeather;
      }

      weatherItems.push(weatherItem);
    }

    return weatherItems;
  } catch (error) {
    logger.error(error);
  }
};
