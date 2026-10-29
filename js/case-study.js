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
      if (link.getAttribute("href") === `#${id}`) {
        link.classList.add("active");
        link.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        link.classList.remove("active");
      }
    });

    mobilePills.forEach((pill) => {
      if (pill.getAttribute("href") === `#${id}`) {
        pill.classList.add("active");
        pill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } else {
        pill.classList.remove("active");
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
});
