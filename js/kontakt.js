document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#reservationForm");
  if (!form) return;

  const dateEl = form.querySelector("#date");
  const timeEl = form.querySelector("#time"); // teď je to <select>
  const submitBtn = form.querySelector("#reservationSubmit");

  const errorEl = document.querySelector("#reservationError");
  const successEl = document.querySelector("#reservationSuccess");

  const OPEN_DAYS = new Set([2, 3, 4, 5, 6]); // Út–So
  const MIN_LEAD_HOURS = 3;

  // Rozsah časů pro příchod: 16:00–20:00 po 15 min
  const START_H = 16;
  const END_H = 20; // včetně 20:00
  const STEP_MIN = 15;

  function showError(msg) {
    if (successEl) successEl.hidden = true;
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.hidden = false;
    } else alert(msg);
  }

  function showSuccess(msg) {
    if (errorEl) errorEl.hidden = true;
    if (successEl) {
      successEl.textContent = msg;
      successEl.hidden = false;
    } else alert(msg);
  }

  function hideMessages() {
    if (errorEl) errorEl.hidden = true;
    if (successEl) successEl.hidden = true;
  }

  const pad2 = (n) => String(n).padStart(2, "0");

  function parseDateInput(value) {
    if (!value) return null;
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  function buildDateTime(dateValue, timeValue) {
    const base = parseDateInput(dateValue);
    if (!base || !timeValue) return null;
    const [hh, mm] = timeValue.split(":").map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    base.setHours(hh, mm, 0, 0);
    return base;
  }

  function minutesOfDay(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  function isAllowedTimeSlot(timeValue) {
    if (!/^\d{2}:\d{2}$/.test(timeValue)) return false;
    const mins = minutesOfDay(timeValue);
    const start = START_H * 60;
    const end = END_H * 60;
    return mins >= start && mins <= end && (mins - start) % STEP_MIN === 0;
  }

  function parsePeople(value) {
    const n = Number.parseInt(String(value), 10);
    return Number.isInteger(n) ? n : NaN;
  }

  function toHHMMFromMinutes(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${pad2(h)}:${pad2(m)}`;
  }

  function normalizePhone(phone) {
    return phone.replace(/\s+/g, "").replace(/-/g, "");
  }

  function isValidPhone(phone) {
    const p = normalizePhone(phone);

    // +420XXXXXXXXX nebo +421XXXXXXXXX
    if (/^\+(420|421)\d{9}$/.test(p)) return true;

    // české číslo bez předvolby (9 číslic)
    if (/^\d{9}$/.test(p)) return true;

    return false;
  }

  function getMinAllowedTimeForToday() {
    const now = new Date();
    const minLead = new Date(now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000);

    // zaokrouhlení nahoru na 15 min
    const mins = minLead.getHours() * 60 + minLead.getMinutes();
    const rounded = Math.ceil(mins / STEP_MIN) * STEP_MIN;

    return toHHMMFromMinutes(rounded);
  }

  function populateTimeOptions(minTimeStr = null) {
    // minTimeStr = "HH:MM" nebo null => od 16:00
    const minAllowed = minTimeStr ? minutesOfDay(minTimeStr) : START_H * 60;

    // vyčisti select
    timeEl.innerHTML = `<option value="" selected disabled>Vyber čas</option>`;

    const start = Math.max(START_H * 60, minAllowed);
    const end = END_H * 60; // včetně

    for (let t = start; t <= end; t += STEP_MIN) {
      const hhmm = toHHMMFromMinutes(t);
      const opt = document.createElement("option");
      opt.value = hhmm;
      opt.textContent = hhmm;
      timeEl.appendChild(opt);
    }
  }

  function isOpenDay(dateObj) {
    return OPEN_DAYS.has(dateObj.getDay());
  }

  function findNextOpenDate(fromDate) {
    const d = new Date(fromDate);
    for (let i = 0; i < 14; i++) {
      if (isOpenDay(d)) return d;
      d.setDate(d.getDate() + 1);
    }
    return null;
  }

  function yyyyMmDd(dateObj) {
    return `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`;
  }

  // min date = dnes
  (function setMinMaxDate() {
    const now = new Date();

    // min = dnes
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    dateEl.min = `${yyyy}-${mm}-${dd}`;

    // max = dnes + 1 měsíc
    const max = new Date(now);
    max.setMonth(max.getMonth() + 1);

    const yyyy2 = max.getFullYear();
    const mm2 = String(max.getMonth() + 1).padStart(2, "0");
    const dd2 = String(max.getDate()).padStart(2, "0");
    dateEl.max = `${yyyy2}-${mm2}-${dd2}`;
  })();

  // při změně data:
  dateEl.addEventListener("change", () => {
    hideMessages();

    const d = parseDateInput(dateEl.value);
    if (!d) return;

    // zakázané dny: Ne + Po
    if (!isOpenDay(d)) {
      showError("V neděli a v pondělí je zavřeno. Vyber prosím jiný den.");
      dateEl.value = "";
      timeEl.innerHTML = `<option value="" selected disabled>Nejdřív vyber datum</option>`;
      return;
    }

    // pokud je dnes, zohledni 3h dopředu
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    if (isToday) {
      const minTimeToday = getMinAllowedTimeForToday();
      // když už dneska nejde (min > 20:00), nabídni nejbližší otevřený den
      if (minutesOfDay(minTimeToday) > END_H * 60) {
        showError(
          "Na dnešek už to nevychází (min. 3 hodiny předem). Vyber prosím jiný den.",
        );
        dateEl.value = "";
        timeEl.innerHTML = `<option value="" selected disabled>Nejdřív vyber datum</option>`;
        return;
      }
      populateTimeOptions(minTimeToday);
    } else {
      populateTimeOptions(null); // plná nabídka 16:00–20:00
    }
  });

  // initial stav
  timeEl.innerHTML = `<option value="" selected disabled>Nejdřív vyber datum</option>`;

  function basicRequiredCheck() {
    const name = form.querySelector("#name")?.value?.trim();
    const phoneRaw = form.querySelector("#phone")?.value?.trim();
    const date = dateEl.value;
    const time = timeEl.value;
    const peopleRaw = form.querySelector("#people")?.value;
    const people = parsePeople(peopleRaw);

    if (!name) return "Doplň prosím jméno.";
    if (!phoneRaw) return "Doplň prosím telefon.";
    if (!isValidPhone(phoneRaw))
      return "Zadej prosím telefon ve správném formátu (např. 725 724 242).";
    if (!date) return "Vyber prosím datum.";
    if (!time) return "Vyber prosím čas.";
    if (!peopleRaw) return "Zadej prosím počet osob.";
    if (!Number.isInteger(people)) return "Zadej prosím platný počet osob.";
    if (people < 1) return "Zadej prosím počet osob.";
    if (people > 20)
      return "Rezervace přes 20 osob řešíme individuálně. Zavolej nám prosím.";
    return null;
  }

  function validateReservation() {
    const err = basicRequiredCheck();
    if (err) return err;

    // honeypot
    const hp = form.querySelector('input[name="company"]')?.value?.trim();
    if (hp) return "Něco je špatně. Zkus to prosím znovu.";

    const now = new Date();

    // dt = konkrétní datum+čas rezervace
    // d  = datum bez času (kvůli dni v týdnu)
    const d = parseDateInput(dateEl.value); // YYYY-MM-DD -> Date 00:00
    const dt = buildDateTime(dateEl.value, timeEl.value);

    if (!d || !dt) return "Zkontroluj prosím datum a čas.";
    if (!isAllowedTimeSlot(timeEl.value)) {
      return "Vyber prosím čas v intervalu 16:00–20:00 (po 15 minutách).";
    }

    // 1) minulost (nejdřív základ)
    if (dt.getTime() < now.getTime()) {
      return "Vybral jsi čas v minulosti.";
    }

    // 2) max 1 měsíc dopředu (globální pravidlo)
    const maxDate = new Date(now);
    maxDate.setMonth(maxDate.getMonth() + 1);
    if (dt.getTime() > maxDate.getTime()) {
      return "Rezervaci lze vytvořit maximálně 1 měsíc dopředu.";
    }

    // 3) otevřené dny (kontroluj jen datum bez času)
    if (!isOpenDay(d)) {
      return "V neděli a v pondělí je zavřeno. Vyber prosím jiný den.";
    }

    // 4h dopředu
    const minLead = new Date(now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000);
    if (dt.getTime() < minLead.getTime()) {
      return `Rezervaci je potřeba poslat alespoň ${MIN_LEAD_HOURS} hodiny předem. Pro urgentní rezervace volej.`;
    }

    return null;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessages();

    const validationError = validateReservation();
    if (validationError) {
      showError(validationError);
      return;
    }

    const formData = new FormData(form);

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Odesílám…";

      const res = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        form.reset();
        timeEl.innerHTML = `<option value="" selected disabled>Nejdřív vyber datum</option>`;
        showSuccess("Rezervace byla odeslána. Ozveme se zpět s potvrzením.");
      } else {
        showError(
          "Nepovedlo se odeslat rezervaci. Zkus to prosím znovu, nebo zavolej.",
        );
      }
    } catch {
      showError(
        "Nepovedlo se odeslat rezervaci. Zkontroluj připojení nebo zavolej.",
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Odeslat rezervaci";
    }
  });
});
