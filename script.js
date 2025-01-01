const searchButton = document.querySelector('.search-btn');
const cityInput = document.querySelector('.city-input');
const weatherCardsDiv = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const locationButton = document.querySelector('.location-btn');

const API_KEY = 'acb6ebb5d1b02276bf51ac1163622975';

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}*C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon" width="80px">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}*C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];
            const sixDaysForecast = [];

            // Collect forecasts for 5 unique days at 12:00 PM
            data.list.forEach(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate) && forecast.dt_txt.includes("12:00:00")) {
                    uniqueForecastDays.push(forecastDate);
                    sixDaysForecast.push(forecast);
                }
            });

            // If we still need a 6th day, find the first entry from the 6th day
            if (uniqueForecastDays.length < 6) {
                const sixthDay = data.list.find(forecast => {
                    const forecastDate = new Date(forecast.dt_txt).getDate();
                    return !uniqueForecastDays.includes(forecastDate);
                });

                if (sixthDay) sixDaysForecast.push(sixthDay);
            }

            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            console.log(sixDaysForecast);
            sixDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(() => {
            alert('Error fetching weather data.');
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // Correctly access and trim the input value
    if (!cityName) return; // Exit if input is empty
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert('No coordinates found for city ' + cityName);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert('Error fetching data'); // Updated error message
        });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert('Error fetching data'); // Updated error message
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert('Access denied for your location service');
            }
        }
    );
}

// Attach event listener correctly
searchButton.addEventListener('click', getCityCoordinates);
locationButton.addEventListener('click', getUserCoordinates);
cityInput.addEventListener('keyup', e => e.key === "Enter" && getCityCoordinates());