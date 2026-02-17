document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("opening-status");
  if (!statusEl) return;

  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const OPEN_HOUR = 16;
  const CLOSE_HOUR = 23;

  const nowMinutes = hours * 60 + minutes;
  const openMinutes = OPEN_HOUR * 60;
  const closeMinutes = CLOSE_HOUR * 60;

  // Neděle / pondělí
  if (day === 0) {
    statusEl.textContent = "ZAVŘENO · akce na objednávku";
    return;
  }

  if (day === 1) {
    statusEl.textContent = "ZAVŘENO · uvidíme se v úterý";
    return;
  }

  // Před otevřením
  if (nowMinutes < openMinutes) {
    const diff = openMinutes - nowMinutes;

    if (diff <= 60) {
      statusEl.textContent = `Otevíráme za ${diff} min`;
    } else {
      statusEl.textContent = `Otevíráme v ${OPEN_HOUR}:00`;
    }
    return;
  }

  // Otevřeno
  if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
    const diff = closeMinutes - nowMinutes;

    // poslední hodina
    if (diff <= 60) {
      statusEl.textContent = `Zavíráme za ${diff} min`;
    } else {
      statusEl.textContent = `Otevřeno do ${CLOSE_HOUR}:00`;
    }
    return;
  }

  // Po zavíračce
  if (nowMinutes >= closeMinutes) {
    // Po půlnoci řeš další den
    const nextDay = new Date(now);
    nextDay.setDate(now.getDate() + 1);

    const nextDayNumber = nextDay.getDay();

    if (nextDayNumber === 0 || nextDayNumber === 1) {
      statusEl.textContent = "Už máme zavřeno · uvidíme se v úterý";
    } else {
      statusEl.textContent = `Už máme zavřeno · zítra od ${OPEN_HOUR}:00`;
    }
  }
});
