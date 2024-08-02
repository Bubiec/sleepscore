function calculateSleepiness(location) {
  const weatherApiKey = CONFIG.OPENWEATHERMAP_API_KEY;
  
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${weatherApiKey}`)
    .then(response => response.json())
    .then(data => {
      const weatherDescription = data.weather[0].description;
      const pressure = data.main.pressure;
      const humidity = data.main.humidity;
      
      let sleepinessScore = 5; // Base sleepiness score
      
      // Adjust score based on weather conditions
      if (weatherDescription.includes('rain') || weatherDescription.includes('thunderstorm')) sleepinessScore -= 1;
      if (weatherDescription.includes('snow')) sleepinessScore -= 1;
      if (weatherDescription.includes('clear')) sleepinessScore += 1;

      // Adjust score based on pressure changes
      const normalPressure = 1013; // hPa
      if (pressure < normalPressure - 10 || pressure > normalPressure + 10) sleepinessScore -= 1;

      // Adjust score based on humidity
      if (humidity > 70 || humidity < 30) sleepinessScore -= 1;

      sleepinessScore = Math.max(0, Math.min(sleepinessScore, 10)); // Ensure score is between 0 and 10

      const sleepinessElement = document.getElementById('sleepiness-score');
      sleepinessElement.innerHTML = `<p>Sleepiness Score: ${sleepinessScore}/10</p>`;
    });
}
