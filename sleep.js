function calculateSleepScore(location, moonPhase) {
  const weatherApiKey = CONFIG.OPENWEATHERMAP_API_KEY;
  return Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${weatherApiKey}&units=metric`).then(res => res.json()),
    fetch(`https://api.sunrise-sunset.org/json?lat=${location.lat}&lng=${location.lon}&formatted=0`).then(res => res.json())
  ]).then(([weatherData, sunData]) => {
    const weatherDescription = weatherData.weather[0].description;
    const temperature = weatherData.main.temp;
    const sunrise = new Date(sunData.results.sunrise);
    const sunset = new Date(sunData.results.sunset);

    let sleepScore = 100;
    let positiveInfluences = [];
    let negativeInfluences = [];

    // Weather conditions
    if (weatherDescription.includes('clear')) {
      sleepScore += 20;
      positiveInfluences.push("Bezchmurne niebo");
    } else {
      if (weatherDescription.includes('rain')) {
        sleepScore -= 20;
        negativeInfluences.push("Deszcz");
      }
      if (weatherDescription.includes('thunderstorm')) {
        sleepScore -= 30;
        negativeInfluences.push("Burza");
      }
      if (weatherDescription.includes('snow')) {
        sleepScore -= 10;
        negativeInfluences.push("Śnieg");
      }
    }

    // Temperature
    if (temperature >= 18 && temperature <= 22) {
      sleepScore += 30;
      positiveInfluences.push("Idealna temperatura (18-22°C)");
    } else if ((temperature >= 15 && temperature < 18) || (temperature > 22 && temperature <= 25)) {
      sleepScore += 10;
      positiveInfluences.push("Umiarkowana temperatura (15-18°C lub 22-25°C)");
    } else {
      sleepScore -= 20;
      negativeInfluences.push("Ekstremalna temperatura");
    }

    // Moon phase influence
    const moonInfluence = calculateMoonInfluence(moonPhase);
    sleepScore += moonInfluence.score;
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

    sleepScore = Math.max(0, sleepScore); // Ensure sleep score is non-negative

    // Update sleep score gauge
    updateGauge('sleep-score-chart', Math.max(0, Math.min(sleepScore, 100)));

    // Display influences
    const positiveInfluencesElement = document.querySelector('#positive-influences ul');
    positiveInfluencesElement.innerHTML = positiveInfluences.map(influence => `<li>${influence}</li>`).join('');

    const negativeInfluencesElement = document.querySelector('#negative-influences ul');
    negativeInfluencesElement.innerHTML = negativeInfluences.map(influence => `<li>${influence}</li>`).join('');
  }).catch(() => {
    // Default sleep score if data cannot be loaded
    updateGauge('sleep-score-chart', 50);
  });
}

function calculateMoonInfluence(moonPhase) {
  let score = 0;
  let description = '';
  
  if (moonPhase === 'new moon') {
    score = +10;
    description = 'Nów';
  } else if (moonPhase === 'first quarter' || moonPhase === 'last quarter') {
    score = 0;
    description = 'Pierwsza kwadra lub ostatnia kwadra';
  } else if (moonPhase === 'waxing crescent' || moonPhase === 'waning crescent') {
    score = -10;
    description = 'Półksiężyc';
  } else if (moonPhase === 'waxing gibbous' || moonPhase === 'waning gibbous') {
    score = -20;
    description = 'Garbata';
  } else if (moonPhase === 'full moon') {
    score = -30;
    description = 'Pełnia';
  }
  
  return { score, description };
}

function createGaugeChart(elementId, title) {
  var options = {
    chart: {
      type: 'radialBar'
    },
    series: [0],
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%'
        },
        dataLabels: {
          value: {
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      }
    },
    labels: [title]
  };

  var chart = new ApexCharts(document.querySelector(`#${elementId}`), options);
  chart.render();

  // Store chart instance
  charts[elementId] = chart;
}

function updateGauge(chartId, value) {
  const chart = charts[chartId];
  if (chart) {
    chart.updateSeries([value]);
  }
}
