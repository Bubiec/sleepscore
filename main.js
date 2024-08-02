const charts = {};

document.addEventListener("DOMContentLoaded", function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const location = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      initApp(location);
    }, () => {
      initApp(CONFIG.DEFAULT_LOCATION);
    });
  } else {
    initApp(CONFIG.DEFAULT_LOCATION);
  }
});

function changeLocation() {
  const locationInput = document.getElementById('location-input').value;
  if (locationInput) {
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${locationInput}&key=YOUR_OPENCAGEDATA_API_KEY`)
      .then(response => response.json())
      .then(data => {
        const location = data.results[0].geometry;
        initApp({ lat: location.lat, lon: location.lng });
      })
      .catch(() => {
        alert('Nie udało się znaleźć lokalizacji.');
      });
  }
}

function initApp(location) {
  showLoader();
  document.getElementById('current-location').textContent = `Obecna lokalizacja: ${location.lat}, ${location.lon}`;
  Promise.all([
    getWeatherData(location),
    getSunData(location),
    new Promise(resolve => {
      const moonPhase = calculateMoonPhase(new Date());
      displayMoonPhase(moonPhase);
      displayNextFullMoon();
      resolve();
    }),
    calculateSleepScore(location, calculateMoonPhase(new Date())),
    checkDarkMode(location)
  ]).catch(() => {
    document.getElementById('error-message').classList.remove('hidden');
  }).finally(() => {
    hideLoader();
    // Initialize gauges with default values if data cannot be loaded
    updateGauge('sleep-score-chart', 50);
  });

  // Initialize gauges with ApexCharts
  createGaugeChart('sleep-score-chart', 'Ocena warunków snu');
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
        track: {
          background: '#3C0341'
        },
        dataLabels: {
          name: {
            fontSize: '16px',
            color: '#FFF',
            offsetY: -10
          },
          value: {
            fontSize: '22px',
            color: '#FFF',
            offsetY: 5,
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        gradientToColors: ['#00C9FF', '#FFD700'],
        stops: [0, 100]
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

function displayMoonPhase(moonPhase) {
  const translatedMoonPhase = moonPhaseTranslations[moonPhase] || moonPhase;
  const moonPhaseElement = document.getElementById('moon-phase');
  moonPhaseElement.innerHTML = `<i class="fas fa-moon"></i><p>${translatedMoonPhase}</p>`;
}

function showLoader() {
  const loader = document.getElementById('loader');
  loader.classList.remove('hidden');
}

function hideLoader() {
  const loader = document.getElementById('loader');
  loader.classList.add('hidden');
}
