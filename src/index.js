// VISUAL_CROSSING_KEY
// GIPHY_KEY
// process.env. ^^^
import './styles.css';

async function weatherSearch(location) {
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${process.env.VISUAL_CROSSING_KEY}`,
    { mode: 'cors' }
  );
  return await response.json();
}

async function getWeatherData(location) {
  const data = await weatherSearch(location);

  const { resolvedAddress, description, latitude, longitude } = data;
  const locationInfo = { resolvedAddress, description, latitude, longitude };

  const weatherKeys = [
    'datetime',
    'conditions',
    'feelslike',
    'temp',
    'humidity',
    'precip',
    'windspeed',
  ];

  const curr = data.currentConditions;
  const currentForecast = weatherKeys.reduce((acc, key) => {
    if (key in curr) {
      acc[key] = curr[key];
    }
    return acc;
  }, {});

  const days = data.days;
  const next5Days = {};
  for (let i = 1; i <= 5; i++) {
    const d = days[i];
    const dayData = weatherKeys.reduce((acc, key) => {
      if (key in d) {
        acc[key] = d[key];
      }
      return acc;
    }, {});
    next5Days[i] = dayData;
  }

  return { locationInfo, currentForecast, next5Days };
}

async function displayWeatherData(location) {
  const weatherData = await getWeatherData(location);

  const currEles = {
    conditionsEle: document.getElementById('curr-conditions'),
    tempEle: document.getElementById('curr-temp'),
    feelslikeEle: document.getElementById('curr-feelslike'),
    humidityEle: document.getElementById('curr-humidity'),
    precipEle: document.getElementById('curr-precip'),
    windspeedEle: document.getElementById('curr-windspeed'),
  };

  currEles.conditionsEle.textContent = weatherData.currentForecast.conditions;
  currEles.tempEle.textContent = weatherData.currentForecast.temp;
  currEles.feelslikeEle.textContent = weatherData.currentForecast.feelslike;
  currEles.humidityEle.textContent = weatherData.currentForecast.humidity;
  currEles.precipEle.textContent = weatherData.currentForecast.precip;
  currEles.windspeedEle.textContent = weatherData.currentForecast.windspeed;
  console.log(weatherData);
}

displayWeatherData('Bozeman');
