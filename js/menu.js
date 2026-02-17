document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("menuModal");
  if (!modal) return;

  const imgEl = document.getElementById("menuModalImg");
  const titleEl = document.getElementById("menuModalTitle");
  const descEl = document.getElementById("menuModalDesc");
  const priceEl = document.getElementById("menuModalPrice");
  const weightEl = document.getElementById("menuModalWeight");

  const closeBtns = modal.querySelectorAll("[data-close]");
  let lastFocus = null;

  function openModal(item) {
    lastFocus = document.activeElement;

    const title = item.dataset.title || "";
    const desc = item.dataset.ings || "";
    const price = item.dataset.price || "";
    const weight = item.dataset.weight || "";
    const img = item.dataset.img || "";
    const alt = item.dataset.alt || title || "Detail jídla";

    titleEl.textContent = title;
    descEl.textContent = desc;
    priceEl.textContent = price;
    weightEl.textContent = weight;

    if (img) {
      imgEl.src = img;
      imgEl.alt = alt;
    } else {
      // fallback placeholder, když chybí fotka
      imgEl.src =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
            <rect width="100%" height="100%" fill="rgba(31,26,22,0.04)"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              fill="rgba(31,26,22,0.35)" font-family="Arial" font-size="34">
              Bez fotky
            </text>
          </svg>`,
        );
      imgEl.alt = alt;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // focus na close
    const close = modal.querySelector(".menu-modal__close");
    close && close.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // vyčisti src (ať se to zbytečně nedrží)
    imgEl.src = "";
    imgEl.alt = "";

    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // otevření na klik
  document.querySelectorAll(".food-item[role='button']").forEach((item) => {
    item.addEventListener("click", () => openModal(item));

    // otevření na Enter/Space
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(item);
      }
    });
  });

  // zavření tlačítkem a kliknutím mimo
  closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));

  // ESC
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
  });
});
