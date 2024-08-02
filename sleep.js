function calculateSleepScore(location, moonPhase) {
  const weatherApiKey = CONFIG.OPENWEATHERMAP_API_KEY;
  return Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${weatherApiKey}&units=metric`
    ).then((res) => res.json()),
    fetch(
      `https://api.sunrise-sunset.org/json?lat=${location.lat}&lng=${location.lon}&formatted=0`
    ).then((res) => res.json()),
  ])
    .then(([weatherData, sunData]) => {
      const weatherDescription = weatherData.weather[0].description;
      const temperature = weatherData.main.temp;
      const sunrise = new Date(sunData.results.sunrise);
      const sunset = new Date(sunData.results.sunset);

      let sleepScore = 100;
      let positiveInfluences = [];
      let negativeInfluences = [];
      let infoText = "";

      // Weather conditions
      if (weatherDescription.includes("clear")) {
        sleepScore += 10;
        positiveInfluences.push("Bezchmurne niebo");
      } else {
        if (weatherDescription.includes("rain")) {
          sleepScore -= 15;
          negativeInfluences.push("Deszcz");
        }
        if (weatherDescription.includes("thunderstorm")) {
          sleepScore -= 25;
          negativeInfluences.push("Burza");
        }
        if (weatherDescription.includes("snow")) {
          sleepScore -= 10;
          negativeInfluences.push("Śnieg");
        }
      }

      // Temperature using Gaussian function for best sleep temperature range
      const idealTemp = 20;
      const tempDiff = Math.abs(temperature - idealTemp);
      sleepScore -= Math.min(50, Math.pow(tempDiff, 2) / 5);
      infoText += `Temperatura: ${temperature}°C, wpływ: ${
        Math.pow(tempDiff, 2) / 5
      }%. `;

      if (temperature >= 18 && temperature <= 22) {
        positiveInfluences.push("Idealna temperatura (18-22°C)");
      } else {
        negativeInfluences.push("Ekstremalna temperatura");
      }

      // Moon phase influence
      const moonInfluence = calculateMoonInfluence(moonPhase);
      sleepScore += moonInfluence.score;
      infoText += `Faza księżyca: ${moonPhase}, wpływ: ${moonInfluence.score}%. `;

      if (moonInfluence.score > 0) {
        positiveInfluences.push(moonInfluence.description);
      } else {
        negativeInfluences.push(moonInfluence.description);
      }

      // Sunrise and sunset times
      if (sunrise.getHours() < 6 || sunrise.getHours() > 8) {
        sleepScore -= 10;
        negativeInfluences.push("Wczesny lub późny wschód słońca");
      }
      if (sunset.getHours() < 18 || sunset.getHours() > 20) {
        sleepScore -= 10;
        negativeInfluences.push("Wczesny lub późny zachód słońca");
      }

      infoText += `Wschód słońca: ${sunrise.getHours()}:${sunrise.getMinutes()}, wpływ: -10%`;
      infoText += `Zachód słońca: ${sunset.getHours()}:${sunset.getMinutes()}, wpływ: -10%`;

      sleepScore = Math.max(0, sleepScore); // Ensure sleep score is non-negative

      // Update sleep score gauge
      updateGauge("sleep-score-chart", Math.max(0, Math.min(sleepScore, 100)));
      document.getElementById("sleep-score-value").innerText = `${Math.max(
        0,
        Math.min(sleepScore, 100)
      )}`;
      document.getElementById("sleep-score-info").innerText = infoText;

      // Display influences
      const positiveInfluencesElement = document.querySelector(
        "#positive-influences ul"
      );
      positiveInfluencesElement.innerHTML = positiveInfluences
        .map((influence) => `<li>${influence}</li>`)
        .join("");

      const negativeInfluencesElement = document.querySelector(
        "#negative-influences ul"
      );
      negativeInfluencesElement.innerHTML = negativeInfluences
        .map((influence) => `<li>${influence}</li>`)
        .join("");
    })
    .catch(() => {
      // Default sleep score if data cannot be loaded
      updateGauge("sleep-score-chart", 50);
      document.getElementById("sleep-score-value").innerText = "50";
    });
}

function calculateMoonInfluence(moonPhase) {
  let score = 0;
  let description = "";

  switch (moonPhase) {
    case "new moon":
      score = 10;
      description = "Nów";
      break;
    case "first quarter":
    case "last quarter":
      score = 0;
      description = "Pierwsza kwadra lub ostatnia kwadra";
      break;
    case "waxing crescent":
    case "waning crescent":
      score = -10;
      description = "Półksiężyc";
      break;
    case "waxing gibbous":
    case "waning gibbous":
      score = -20;
      description = "Garbata";
      break;
    case "full moon":
      score = -30;
      description = "Pełnia";
      break;
  }

  return { score, description };
}
