document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("opening-status");
  if (!statusEl) return;

  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const OPEN_HOUR = 16;
  const CLOSE_HOUR = 23;

  if (day === 0 || day === 1) {
    statusEl.textContent = "ZAVŘENO";
    return;
  }

  const nowMinutes = hours * 60 + minutes;
  const openMinutes = OPEN_HOUR * 60;
  const closeMinutes = CLOSE_HOUR * 60;

  if (nowMinutes < openMinutes) {
    statusEl.textContent = `Otevíráme v ${OPEN_HOUR}:00`;
  } else if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
    statusEl.textContent = `Otevřeno do ${CLOSE_HOUR}:00`;
  } else {
    statusEl.textContent = "ZAVŘENO";
  }
});
