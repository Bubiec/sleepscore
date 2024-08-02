function getSunData(location) {
  return fetch(`https://api.sunrise-sunset.org/json?lat=${location.lat}&lng=${location.lon}&formatted=0`)
    .then(response => response.json())
    .then(data => {
      const sunsetSunrise = document.getElementById('sunset-sunrise');
      sunsetSunrise.innerHTML = `
        <p>Wschód słońca: ${new Date(data.results.sunrise).toLocaleTimeString()}</p>
        <p>Zachód słońca: ${new Date(data.results.sunset).toLocaleTimeString()}</p>
      `;
    })
    .catch(() => {
      const sunsetSunrise = document.getElementById('sunset-sunrise');
      sunsetSunrise.innerHTML = `
        <p>Wschód słońca: -</p>
        <p>Zachód słońca: -</p>
      `;
    });
}
