/**
 * Play Page Interactions & Setup
 * Handles 3D console embed, mobile menu, cursor tracking, and footer utilities.
 */

document.addEventListener("DOMContentLoaded", function () {
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

  // 1. Mobile Menu Drawer Toggle
  const menuBtn = document.querySelector(".menu");
  const mobileNav = document.getElementById("mobile-navigation");
  const backdrop = document.querySelector(".mobilenav__backdrop");

  if (menuBtn && mobileNav) {
    function toggleMenu() {
      const isOpen = document.body.classList.toggle("menu_open");
      menuBtn.setAttribute("aria-expanded", isOpen);
      menuBtn.textContent = isOpen ? "Close" : "Menu";
    }

    menuBtn.addEventListener("click", toggleMenu);
    if (backdrop) backdrop.addEventListener("click", toggleMenu);

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (document.body.classList.contains("menu_open")) {
          toggleMenu();
        }
      });
    });
  }

  // 2. Custom Cursor Follower
  const cursor = document.querySelector(".cursor");
  const cursorInner = document.querySelector(".cursor__inner");
  const cursorDot = document.getElementById("cursorDot");

  if (cursor && cursorInner && cursorDot) {
    let mouseX = -100;
    let mouseY = -100;
    let dotX = -100;
    let dotY = -100;
    let innerX = -100;
    let innerY = -100;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.opacity = "1";
    });

    document.addEventListener("mouseleave", function () {
      cursor.style.opacity = "0";
    });

    function animateCursor() {
      dotX += (mouseX - dotX) * 0.8;
      dotY += (mouseY - dotY) * 0.8;
      innerX += (mouseX - innerX) * 0.18;
      innerY += (mouseY - innerY) * 0.18;

      cursorDot.style.transform = "translate(" + dotX + "px, " + dotY + "px)";
      cursorInner.style.transform = "translate(" + innerX + "px, " + innerY + "px)";

      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Interactive element hover scale
    const hoverTargets = document.querySelectorAll("a, button, .footer-hero-stack, [data-hover]");
    hoverTargets.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursorInner.classList.add("cursor--hover");
      });
      el.addEventListener("mouseleave", function () {
        cursorInner.classList.remove("cursor--hover");
      });
    });
  }

  // 3. Footer Dynamic IST Clock
  const timeEl = document.getElementById("footer-time");
  if (timeEl) {
    function updateClock() {
      try {
        const now = new Date();
        const options = { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false };
        const timeStr = new Intl.DateTimeFormat("en-GB", options).format(now);
        timeEl.textContent = "IST → " + timeStr;
      } catch (err) {
        timeEl.textContent = "IST → 22:00";
      }
    }
    updateClock();
    setInterval(updateClock, 10000);
  }

  // 4. Subtle Footer Hover Sound or Glow
  const footerLines = document.querySelectorAll(".footer-glow-line");
  footerLines.forEach(function (line) {
    line.addEventListener("mouseenter", function () {
      line.style.textShadow = "0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(0, 255, 128, 0.4)";
    });
    line.addEventListener("mouseleave", function () {
      line.style.textShadow = "";
    });
  });
});
