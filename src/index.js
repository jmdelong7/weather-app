// VISUAL_CROSSING_KEY
// GIPHY_KEY
// process.env. ^^^
import { format, parseISO } from 'date-fns';
import './styles.css';

async function fetchWeatherData(location) {
  const encoded = encodeURIComponent(location);
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encoded}?key=${process.env.VISUAL_CROSSING_KEY}`,
    { mode: 'cors' }
  );
  return await response.json();
}

async function getWeatherData(location) {
  const data = await fetchWeatherData(location);

  const { resolvedAddress, description, latitude, longitude } = data;
  const locationInfo = { resolvedAddress, description, latitude, longitude };

  const weatherKeys = [
    'datetime',
    'conditions',
    'feelslike',
    'temp',
    'humidity',
    'precip',
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
  createWeatherCard();

  const currEles = {
    conditionsEle: document.getElementById('curr-conditions'),
    tempEle: document.getElementById('curr-temp'),
    feelslikeEle: document.getElementById('curr-feelslike'),
    humidityEle: document.getElementById('curr-humidity'),
    precipEle: document.getElementById('curr-precip'),
  };

  currEles.conditionsEle.textContent = weatherData.currentForecast.conditions;
  currEles.tempEle.textContent = weatherData.currentForecast.temp + '° F';
  currEles.feelslikeEle.textContent =
    weatherData.currentForecast.feelslike + '° F';
  currEles.humidityEle.textContent =
    weatherData.currentForecast.humidity + ' %';
  currEles.precipEle.textContent = weatherData.currentForecast.precip;

  const locEles = {
    resolvedAddress: document.getElementById('location'),
    description: document.getElementById('description'),
  };

  locEles.resolvedAddress.textContent =
    weatherData.locationInfo.resolvedAddress;
  locEles.description.textContent = weatherData.locationInfo.description;

  const next5Days = weatherData.next5Days;
  for (let i = 1; i < 6; i++) {
    const weatherCard = document.getElementById(`future-card-${i}`);
    const data = next5Days[`${i}`];

    const day = weatherCard.querySelector('p.future-weather-day-text');
    const conditions = weatherCard.querySelector('p.future-conditions-text');
    const temp = weatherCard.querySelector('p.future-temp-text');

    day.textContent = format(parseISO(data.datetime), 'EEEE');
    conditions.textContent = data.conditions;
    temp.textContent = data.temp + '° F';
  }

  return weatherData.currentForecast.conditions;
}

async function gifConditionsSearch(conditions) {
  const encoded = encodeURIComponent(conditions);
  const response = await fetch(
    `https://api.giphy.com/v1/gifs/translate?api_key=${process.env.GIPHY_KEY}&s=${encoded}`,
    { mode: 'cors' }
  );
  const jsonData = await response.json();
  const gif = jsonData.data.images.fixed_width.url;
  const gifFrame = document.getElementById('gif-frame');
  gifFrame.style.backgroundImage = `url(${gif})`;
}

async function weatherSearch(searchInput) {
  const data = await displayWeatherData(searchInput);
  gifConditionsSearch(data);
}

function createWeatherCard() {
  const container = document.querySelector('.future-weather-cards-container');
  container.innerHTML = '';
  let containerInner = container.innerHTML;
  for (let i = 1; i < 6; i++) {
    let card = `<div class="future-weather-card" id="future-card-${i}">
        <div class="future-weather-day">
          <p class="future-weather-day-text wh">Wednesday</p>
        </div>
        <div class="future-conditions">
          <p class="future-conditions-text wh">bla bla bla bla bla bla bla bla bla</p>
        </div>
        <div class="future-temp">
          <p class="future-temp-text data">999.99</p>
        </div>
      </div>`;
    containerInner += card;
    container.innerHTML = containerInner;
  }
}

// createWeatherCard();

function addListeners() {
  const searchBar = document.getElementById('search');
  document.getElementById('searchForm').addEventListener('submit', (event) => {
    event.preventDefault();
    weatherSearch(searchBar.value);
  });
  const modal = document.querySelector('dialog');
  document.getElementById('#next5days').addEventListener('click', () => {
    modal.showModal();
  });
  document.getElementById('close').addEventListener('click', () => {
    modal.close();
  });
}

addListeners();

// displayWeatherData('san diego');
// gifConditionsSearch('funny');
