document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#nav-menu");
  const navOverlay = document.querySelector(".nav-overlay");

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (navOverlay) navOverlay.hidden = true;
  }

  function openMenu() {
    if (!menu || !toggle) return;
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    if (navOverlay) navOverlay.hidden = false;
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const willOpen = !menu.classList.contains("is-open");
      if (willOpen) openMenu();
      else closeMenu();
    });

    if (navOverlay) {
      navOverlay.addEventListener("click", () => closeMenu());
    }

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (menu.classList.contains("is-open")) closeMenu();
    });
  }

  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY;
      const beyondTop = currentY > 120;

      if (scrollingDown && beyondTop) {
        siteHeader.classList.add("is-hidden");
      } else {
        siteHeader.classList.remove("is-hidden");
      }

      lastScrollY = currentY;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  const gallery = document.getElementById("gallery");
  const lb = document.getElementById("lightbox");
  if (!gallery || !lb) return;

  const imgEl = lb.querySelector(".lb-img");
  const btnClose = lb.querySelector(".lb-close");
  const btnPrev = lb.querySelector(".lb-prev");
  const btnNext = lb.querySelector(".lb-next");

  const items = Array.from(gallery.querySelectorAll(".g-item"));
  let index = 0;

  function openAt(i) {
    index = (i + items.length) % items.length;
    const src = items[index].getAttribute("data-full");
    const alt = items[index].querySelector("img")?.getAttribute("alt") || "";
    imgEl.src = src;
    imgEl.alt = alt;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    imgEl.removeAttribute("src");
    imgEl.removeAttribute("alt");
    document.body.style.overflow = "";
  }

  function prev() {
    openAt(index - 1);
  }
  function next() {
    openAt(index + 1);
  }

  items.forEach((btn, i) => btn.addEventListener("click", () => openAt(i)));
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", prev);
  btnNext.addEventListener("click", next);

  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });
});
