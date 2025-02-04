import { format, parseISO } from 'date-fns';
import './styles.css';

async function fetchWeatherData(location) {
  try {
    const encoded = encodeURIComponent(location);
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encoded}?key=${process.env.VISUAL_CROSSING_KEY}`,
      { mode: 'cors' }
    );

    if (!response.ok) {
      console.log('Error @ fetchWeatherData:', response);
      showSearchError();
      return null;
    }

    hideError();
    return await response.json();
  } catch (error) {
    console.log('Error @ fetchWeatherData:', error);
    showSearchError();
    return null;
  }
}

async function getWeatherData(location) {
  const data = await fetchWeatherData(location);

  if (!data) {
    console.log('Error @ getWeatherData:', data);
    showSearchError();
    return null;
  }

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

async function updateWeatherData(location) {
  const weatherData = await getWeatherData(location);
  if (!weatherData) {
    console.log('Error @ weatherData:', weatherData);
    showSearchError();
    return null;
  }
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

  const checked = document.getElementById('f-to-c').getAttribute('checked');
  if (checked === 'false') {
    updateTemps();
  }

  return weatherData.currentForecast.conditions;
}

function updateTemps() {
  const tempEle = document.getElementById('curr-temp');
  if (tempEle === null) return;
  const feelslikeEle = document.getElementById('curr-feelslike');

  tempEle.textContent = tempConverter(tempEle.textContent);
  feelslikeEle.textContent = tempConverter(feelslikeEle.textContent);

  for (let i = 1; i < 6; i++) {
    const weatherCard = document.getElementById(`future-card-${i}`);
    const temp = weatherCard.querySelector('p.future-temp-text');

    temp.textContent = tempConverter(temp.textContent);
  }
}

function tempConverter(val) {
  const checked = document.getElementById('f-to-c').getAttribute('checked');
  const split = String(val).split('°');
  const num = Number(split[0]);
  if (checked === 'true') {
    const fahrenheit = String(Math.round(10 * (num * (9 / 5) + 32)) / 10);
    return fahrenheit + '° F';
  } else if (checked === 'false') {
    const celcius = String(Math.round(10 * (num - 32) * (5 / 9)) / 10);
    return celcius + '° C';
  }
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
  const data = await updateWeatherData(searchInput);
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

function displayInitSearch() {
  const locationInfo = document.querySelector('.locationinfo-sec');
  if (locationInfo !== null) return;

  const body = document.querySelector('body');
  const initGif = document.getElementById('initial-gif');

  if (initGif) initGif.remove();

  const sections = document.createElement('div');
  sections.innerHTML = `<section class="locationinfo-sec sc">
      <div class="location">
        <h2 class="location-long" id="location">Location</h2>
      </div>
      <div class="description-container">
        <h3 class="description-header wh"></h3>
        <p class="description-data" id="description">
          description
        </p>
      </div>
    </section>
    <section class="main-sec">
      <div class="weather-card">
        <div class="main-info-container mc">
          <div class="gif-frame mf-left" id="gif-frame"></div>
          <div class="mf-right">
            <div class="conditions dc">
              <h3 class="conditions-header wh"></h3>
              <p class="conditions-data data" id="curr-conditions">
                conditions
              </p>
            </div>
            <div class="temp-feelslike-container sc">
              <div class="temp dc">
                <h3 class="temp-header wh"></h3>
                <p class="temp-data data" id="curr-temp">temp
                </p>
              </div>
              <div class="feelslike dc">
                <h3 class="feelslike-header wh">Feels like</h3>
                <p class="feelslike-data data" id="curr-feelslike">temp
                </p>
              </div>
            </div>
            <div class="secondary-info-container sc">
              <div class="humidity dc">
                <h3 class="humidity-header wh">Humidity</h3>
                <p class="humidity-data data" id="curr-humidity">percent</p>
              </div>
              <div class="precip dc">
                <h3 class="precip-header wh">Precipitation</h3>
                <p class="precip-data data" id="curr-precip">precip</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button id="next5days">See Next 5 Days</button>
      <dialog>
        <div class="future-weather-cards-container"></div>
        <div class="close-button-container">
          <button class="close" id="close">Close</button>
        </div>
      </dialog>
    </section>`;

  body.appendChild(sections);

  const modal = document.querySelector('dialog');
  document.getElementById('next5days').addEventListener('click', () => {
    modal.showModal();
  });

  document.getElementById('close').addEventListener('click', () => {
    modal.close();
  });
}

function fahrenheitToCelciusBtn() {
  const fcBtn = document.querySelector('.f-c-icon-border');
  const fBtn = document.querySelector('.f-c-icon-left');
  const cBtn = document.querySelector('.f-c-icon-right');
  const checkbox = document.getElementById('f-to-c');

  fcBtn.addEventListener('click', () => {
    if (fBtn.classList.contains('accent-color')) {
      cBtn.classList.add('accent-color');
      fBtn.classList.remove('accent-color');
      checkbox.setAttribute('checked', false);
    } else {
      cBtn.classList.remove('accent-color');
      fBtn.classList.add('accent-color');
      checkbox.setAttribute('checked', true);
    }
    updateTemps();
  });
}

function addSearchListener() {
  const searchBar = document.getElementById('search');
  const searchForm = document.getElementById('searchForm');

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    displayInitSearch();
    weatherSearch(searchBar.value);
  });
}

function showSearchError() {
  const searchError = document.getElementById('search-error');
  searchError.classList.remove('hide-error');
}

function hideError() {
  const searchError = document.getElementById('search-error');
  searchError.classList.add('hide-error');
}

addSearchListener();
fahrenheitToCelciusBtn();
