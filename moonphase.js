function calculateMoonPhase(date) {
  const synodicMonth = 29.53058867; // średnia długość miesiąca synodycznego w dniach
  const knownNewMoon = new Date('2000-01-06T18:14:00Z'); // Data znanego nowiu
  const current = date || new Date(); // Aktualna data

  const daysSinceKnownNewMoon = (current - knownNewMoon) / (1000 * 60 * 60 * 24);
  const currentSynodicMonth = daysSinceKnownNewMoon % synodicMonth;

  if (currentSynodicMonth < 1.84566) return 'new moon';
  if (currentSynodicMonth < 5.53699) return 'waxing crescent';
  if (currentSynodicMonth < 9.22831) return 'first quarter';
  if (currentSynodicMonth < 12.91963) return 'waxing gibbous';
  if (currentSynodicMonth < 16.61096) return 'full moon';
  if (currentSynodicMonth < 20.30228) return 'waning gibbous';
  if (currentSynodicMonth < 23.99361) return 'last quarter';
  if (currentSynodicMonth < 27.68493) return 'waning crescent';
  
  return 'new moon';
}

function calculateNextFullMoon() {
  const currentDate = new Date();
  const nextFullMoon = new Date(currentDate);

  const daysUntilFullMoon = 29.53; // Average number of days in a lunar cycle
  const currentPhase = calculateMoonPhase(currentDate);

  if (currentPhase === 'full moon') {
    nextFullMoon.setDate(currentDate.getDate() + daysUntilFullMoon);
  } else {
    const daysSinceFullMoon = daysUntilFullMoon - currentPhaseToDays[currentPhase];
    nextFullMoon.setDate(currentDate.getDate() + daysSinceFullMoon);
  }

  return nextFullMoon;
}

function displayNextFullMoon() {
  const nextFullMoon = calculateNextFullMoon();
  const fullMoonElement = document.getElementById('next-full-moon');
  fullMoonElement.innerHTML = `<i class="fas fa-moon"></i><p>Następna pełnia: ${nextFullMoon.toLocaleDateString()}</p>`;
}

const moonPhaseTranslations = {
  "new moon": "nów",
  "first quarter": "pierwsza kwadra",
  "waxing crescent": "przybywający sierp",
  "waxing gibbous": "przybywający garb",
  "full moon": "pełnia",
  "waning gibbous": "ubywający garb",
  "last quarter": "ostatnia kwadra",
  "waning crescent": "ubywający sierp"
};