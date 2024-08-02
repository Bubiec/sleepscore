function checkDarkMode() {
  fetch(`https://api.sunrise-sunset.org/json?lat=52.2297&lng=21.0122&formatted=0`)
    .then(response => response.json())
    .then(data => {
      const currentTime = new Date();
      const sunrise = new Date(data.results.sunrise);
      const sunset = new Date(data.results.sunset);
      const darkModeStart = new Date(sunset.getTime() - 60 * 60 * 1000);
      const darkModeEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);

      if (currentTime >= darkModeStart || currentTime <= darkModeEnd) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    });
}
