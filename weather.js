const weatherTranslations = {
  "clear sky": "bezchmurne niebo",
  "few clouds": "mało chmur",
  "scattered clouds": "rozproszone chmury",
  "broken clouds": "zachmurzenie umiarkowane",
  "shower rain": "przelotny deszcz",
  "rain": "deszcz",
  "thunderstorm": "burza",
  "snow": "śnieg",
  "mist": "mgła"
};

function getWeatherData(location) {
  const apiKey = CONFIG.OPENWEATHERMAP_API_KEY;
  return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const weatherDescription = weatherTranslations[data.weather[0].description] || data.weather[0].description;
      const temperature = data.main.temp;
      const weatherConditions = document.getElementById('weather-conditions');
      weatherConditions.innerHTML = `
        <p>Warunki pogodowe: ${weatherDescription}</p>
        <p>Temperatura: ${temperature}°C</p>
      `;
    })
    .catch(() => {
      const weatherConditions = document.getElementById('weather-conditions');
      weatherConditions.innerHTML = `
        <p>Warunki pogodowe: -</p>
        <p>Temperatura: -</p>
      `;
    });
}
