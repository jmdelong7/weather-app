// VISUAL_CROSSING_KEY
// GIPHY_KEY
// process.env. ^^^

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

getWeatherData('Seattle').then((d) => console.log(d));
