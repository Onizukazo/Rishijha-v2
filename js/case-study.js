/**
 * Case Study Interactive Functionality:
 * - ScrollSpy for all 22 original slides
 * - Smooth scroll with header offset
 * - Mobile navigation menu toggle
 * - Custom cursor tracking
 */

document.addEventListener("DOMContentLoaded", () => {
  // Record subpage visit for smart preloader skip
  try {
    sessionStorage.setItem("last_subpage", window.location.pathname);
  } catch (e) {}

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a");
    if (a && a.getAttribute("href") && a.getAttribute("href").indexOf("index.html") !== -1) {
      try {
        sessionStorage.setItem("from_internal_nav", "true");
      } catch (err) {}
    }
  });

  // 1. Mobile Menu Toggle
  const menuBtn = document.querySelector(".menu");
  const backdrop = document.querySelector(".mobilenav__backdrop");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      document.body.classList.toggle("menu_open");
      const isOpen = document.body.classList.contains("menu_open");
      menuBtn.textContent = isOpen ? "Close" : "Menu";
      menuBtn.setAttribute("aria-expanded", isOpen);
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      document.body.classList.remove("menu_open");
      if (menuBtn) {
        menuBtn.textContent = "Menu";
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Close mobile menu on Esc key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu_open")) {
      document.body.classList.remove("menu_open");
      if (menuBtn) {
        menuBtn.textContent = "Menu";
        menuBtn.setAttribute("aria-expanded", "false");
      }
    }
  });

  // 2. ScrollSpy for Case Study Sections
  const sections = Array.from(document.querySelectorAll(".cs-slide-section"));
  const sidebarLinks = Array.from(document.querySelectorAll(".cs-sidebar-nav a"));
  const mobilePills = Array.from(document.querySelectorAll(".cs-mobile-pill"));

  let isClickScrolling = false;
  let clickTimeout = null;

  function setActive(id) {
    sidebarLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isMatch);
    });

    mobilePills.forEach((pill) => {
      const isMatch = pill.getAttribute("href") === `#${id}`;
      pill.classList.toggle("active", isMatch);
      if (isMatch) {
        // Horizontally center the active pill inside the quicknav bar without hijacking window scroll
        const quickNav = pill.closest(".cs-mobile-quicknav");
        if (quickNav) {
          const targetLeft = pill.offsetLeft - (quickNav.clientWidth / 2) + (pill.clientWidth / 2);
          quickNav.scrollTo({ left: targetLeft, behavior: "smooth" });
        }
      }
    });
  }

  // Smooth click scroll with 90px header offset
  function handleNavClick(e) {
    const href = this.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    isClickScrolling = true;
    clearTimeout(clickTimeout);

    const top = target.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({
      top: top,
      behavior: "smooth"
    });

    history.replaceState(null, "", href);
    setActive(target.id);

    // Re-enable scroll listener after smooth scroll finishes
    clickTimeout = setTimeout(() => {
      isClickScrolling = false;
    }, 800);
  }

  sidebarLinks.forEach((l) => l.addEventListener("click", handleNavClick));
  mobilePills.forEach((p) => p.addEventListener("click", handleNavClick));

  // Robust Scroll Position Tracker for Sections
  let ticking = false;
  function onScroll() {
    if (isClickScrolling) return;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        const triggerLine = scrollPos + 180;

        let activeId = sections[0]?.id || "introduction";

        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          if (sec.offsetTop <= triggerLine) {
            activeId = sec.id;
          }
        }

        // Bottom of page check
        if (window.innerHeight + scrollPos >= document.documentElement.scrollHeight - 50) {
          if (sections.length > 0) {
            activeId = sections[sections.length - 1].id;
          }
        }

        setActive(activeId);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  // Initial check
  onScroll();

  // 3. Custom Cursor Follower
  const cursor = document.querySelector(".cursor");
  const cursorDot = document.getElementById("cursorDot");
  if (cursor && cursorDot && window.matchMedia("(pointer: fine)").matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function renderCursor() {
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;
      cursor.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

  // 4. Enlarged Scrollable Slide Viewer (Lightbox)
  const slideImages = Array.from(
    document.querySelectorAll(".cs-slide-card img, .cs-stretch-img")
  );
  if (slideImages.length > 0) {
    const isStretchBoard = !!document.querySelector(".cs-stretch-board");
    const lightbox = document.createElement("div");
    lightbox.className = "cs-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Enlarged Case Study Slides");

    lightbox.innerHTML = `
      <div class="cs-lightbox__topbar">
        <span class="cs-lightbox__hint">Scroll to browse slides &bull; Esc or click outside to close</span>
        <button type="button" class="cs-lightbox__close" aria-label="Close enlarged view">Close &times;</button>
      </div>
      <div class="cs-lightbox__scroll">
        <div class="cs-lightbox__track${isStretchBoard ? " cs-lightbox__track--stretch" : ""}"></div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const scrollWrap = lightbox.querySelector(".cs-lightbox__scroll");
    const track = lightbox.querySelector(".cs-lightbox__track");
    const closeBtn = lightbox.querySelector(".cs-lightbox__close");
    let built = false;

    function buildTrack() {
      if (built) return;
      built = true;
      slideImages.forEach((srcImg) => {
        const item = document.createElement("div");
        item.className = "cs-lightbox__item";

        const img = document.createElement("img");
        img.src = srcImg.currentSrc || srcImg.getAttribute("src");
        img.alt = srcImg.alt || "";
        if (srcImg.getAttribute("width")) img.width = srcImg.getAttribute("width");
        if (srcImg.getAttribute("height")) img.height = srcImg.getAttribute("height");
        item.appendChild(img);

        const card = srcImg.closest(".cs-slide-card");
        if (card) {
          const bar = card.querySelector(".cs-slide-bar");
          if (bar) {
            const cap = document.createElement("div");
            cap.className = "cs-lightbox__caption";
            cap.innerHTML = bar.innerHTML;
            item.appendChild(cap);
          }
        }
        track.appendChild(item);
      });
    }

    function openLightbox(index, clickRatio) {
      buildTrack();
      lightbox.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";

      requestAnimationFrame(() => {
        const targetItem = track.children[index];
        if (targetItem) {
          const itemTop = targetItem.offsetTop - 20;
          const extraOffset = isStretchBoard && clickRatio > 0
            ? Math.max(0, targetItem.offsetHeight * clickRatio - scrollWrap.clientHeight * 0.35)
            : 0;
          scrollWrap.scrollTop = Math.max(0, itemTop + extraOffset);
        }
      });
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.documentElement.style.overflow = "";
    }

    slideImages.forEach((img, idx) => {
      const target = img.closest(".cs-slide-card") || img;
      target.addEventListener("click", (e) => {
        const rect = target.getBoundingClientRect();
        const ratio = rect.height > 0 ? Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)) : 0;
        openLightbox(idx, ratio);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    scrollWrap.addEventListener("click", (e) => {
      if (e.target === scrollWrap || e.target === track) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }
});
