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

  // 2. Sidebar Toggle (Desktop Collapse & Mobile Drawer)
  const headerToggleBtn = document.getElementById("csHeaderSidebarToggle") || document.querySelector(".cs-header-sidebar-toggle");
  const sidebarCloseBtn = document.getElementById("csSidebarClose") || document.querySelector(".cs-sidebar-close-btn");
  const sidebarBackdrop = document.getElementById("csSidebarBackdrop") || document.querySelector(".cs-sidebar-backdrop");

  function toggleSidebar() {
    if (window.innerWidth > 1024) {
      document.body.classList.toggle("sidebar-collapsed");
      try {
        localStorage.setItem("cs_sidebar_collapsed", document.body.classList.contains("sidebar-collapsed"));
      } catch (err) {}
    } else {
      document.body.classList.toggle("sidebar-open-mobile");
    }
  }

  function closeMobileSidebar() {
    document.body.classList.remove("sidebar-open-mobile");
  }

  if (headerToggleBtn) {
    headerToggleBtn.addEventListener("click", toggleSidebar);
  }
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", toggleSidebar);
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", closeMobileSidebar);
  }

  // Close mobile sidebar on Esc key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("sidebar-open-mobile")) {
      closeMobileSidebar();
    }
  });

  // Restore saved collapse state on desktop
  try {
    if (window.innerWidth > 1024 && localStorage.getItem("cs_sidebar_collapsed") === "true") {
      document.body.classList.add("sidebar-collapsed");
    }
  } catch (err) {}

  // 3. ScrollSpy for Case Study Sections
  const sections = Array.from(document.querySelectorAll(".cs-slide-section"));
  const topPills = Array.from(document.querySelectorAll(".cs-top-pill"));
  const sidebarLinks = Array.from(document.querySelectorAll(".cs-sidebar-item, .cs-sidebar-nav a"));
  const mobilePills = Array.from(document.querySelectorAll(".cs-mobile-pill"));

  let isClickScrolling = false;
  let clickTimeout = null;

  function setActive(id) {
    topPills.forEach((pill) => {
      const isMatch = pill.getAttribute("href") === `#${id}`;
      pill.classList.toggle("active", isMatch);
      if (isMatch) {
        const topNav = pill.closest(".cs-top-nav");
        if (topNav) {
          const targetLeft = pill.offsetLeft - (topNav.clientWidth / 2) + (pill.clientWidth / 2);
          topNav.scrollTo({ left: targetLeft, behavior: "smooth" });
        }
      }
    });

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

  // Smooth click scroll with header offset
  function handleNavClick(e) {
    const href = this.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    isClickScrolling = true;
    clearTimeout(clickTimeout);

    // On mobile, automatically close the sidebar drawer after selecting a section
    if (window.innerWidth <= 1024) {
      closeMobileSidebar();
    }

    const headerOffset = window.innerWidth <= 900 ? 76 : 68;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
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

  topPills.forEach((p) => p.addEventListener("click", handleNavClick));
  sidebarLinks.forEach((l) => l.addEventListener("click", handleNavClick));
  mobilePills.forEach((p) => p.addEventListener("click", handleNavClick));

  const scrollIndicator = document.querySelector(".cs-hero-scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", handleNavClick);
  }

  // Robust Scroll Position Tracker & Hero Reveal Parallax
  const heroInner = document.querySelector(".cs-top-hero .cs-container");
  const heroSec = document.querySelector(".cs-top-hero");

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollPos = window.pageYOffset || document.documentElement.scrollTop;

        // Subtle hero container fade/parallax as case study deck rolls up over it
        if (heroInner && heroSec) {
          const heroH = heroSec.offsetHeight || 500;
          const fadeProgress = Math.min(1, Math.max(0, scrollPos / (heroH * 0.75)));
          heroInner.style.opacity = (1 - fadeProgress * 0.7).toFixed(3);
          heroInner.style.transform = `translateY(${(scrollPos * 0.15).toFixed(1)}px)`;
        }

        // Smooth fade out for scroll indicator on scroll
        if (scrollIndicator) {
          const indOpacity = Math.max(0, 1 - scrollPos / 140);
          scrollIndicator.style.opacity = indOpacity.toFixed(3);
          scrollIndicator.style.pointerEvents = indOpacity < 0.05 ? "none" : "auto";
        }

        if (isClickScrolling) {
          ticking = false;
          return;
        }

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

  // 4. Enlarged Scrollable Slide Viewer (Lightbox / Full Screen)
  const slideImages = Array.from(
    document.querySelectorAll(".cs-slide-card img, .cs-stretch-img")
  );
  if (slideImages.length > 0) {
    const isStretchBoard = !!document.querySelector(".cs-stretch-board");
    const sections = Array.from(document.querySelectorAll(".cs-slide-section"));
    
    // Build structured section list with slide indices
    const sectionData = sections.map((sec) => {
      const id = sec.id;
      const navLink = document.querySelector(`.cs-sidebar-nav a[href="#${id}"], .cs-mobile-quicknav a[href="#${id}"]`);
      let label = navLink ? navLink.textContent.replace(/\s+/g, " ").trim() : "";
      if (!label) {
        label = sec.querySelector(".cs-section-tag")?.textContent.trim() || id;
      }
      const firstImg = sec.querySelector(".cs-slide-card img, .cs-stretch-img");
      const slideIndex = firstImg ? slideImages.indexOf(firstImg) : 0;
      return { id, label, slideIndex, el: sec };
    });

    const lightbox = document.createElement("div");
    lightbox.className = "cs-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Full Screen Case Study Slides");

    lightbox.innerHTML = `
      <div class="cs-lightbox__topbar">
        <div class="cs-lightbox__topbar-left">
          <button type="button" class="cs-lightbox__back-btn" aria-label="Close full screen view">
            <span class="cs-lightbox__back-arrow">&larr;</span>
            <span class="cs-lightbox__back-text">Back</span>
          </button>
          <span class="cs-lightbox__divider" aria-hidden="true">|</span>
          <span class="cs-lightbox__hint">Esc or click outside to close</span>
        </div>
        <nav class="cs-lightbox__nav" aria-label="Full screen section navigation"></nav>
        <div class="cs-lightbox__topbar-right">
          <button type="button" class="cs-lightbox__close" aria-label="Close enlarged view">Close &times;</button>
        </div>
      </div>
      <div class="cs-lightbox__scroll">
        <div class="cs-lightbox__track${isStretchBoard ? " cs-lightbox__track--stretch" : ""}"></div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const scrollWrap = lightbox.querySelector(".cs-lightbox__scroll");
    const track = lightbox.querySelector(".cs-lightbox__track");
    const closeBtn = lightbox.querySelector(".cs-lightbox__close");
    const backBtn = lightbox.querySelector(".cs-lightbox__back-btn");
    const navContainer = lightbox.querySelector(".cs-lightbox__nav");
    let built = false;
    let isLightboxNavScrolling = false;
    let navTimeout = null;

    // Populate section navigation pills inside the full screen topbar
    if (navContainer && sectionData.length > 0) {
      sectionData.forEach((sec, sIdx) => {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = "cs-lightbox__nav-pill" + (sIdx === 0 ? " active" : "");
        pill.dataset.sectionId = sec.id;
        pill.dataset.slideIndex = sec.slideIndex;
        pill.textContent = sec.label;
        pill.addEventListener("click", (e) => {
          e.stopPropagation();
          scrollToLightboxSection(sIdx);
        });
        navContainer.appendChild(pill);
      });
    }

    function setActiveLightboxPill(activeId) {
      const pills = navContainer.querySelectorAll(".cs-lightbox__nav-pill");
      pills.forEach((p) => {
        const isMatch = p.dataset.sectionId === activeId;
        p.classList.toggle("active", isMatch);
        if (isMatch) {
          const targetLeft = p.offsetLeft - (navContainer.clientWidth / 2) + (p.clientWidth / 2);
          navContainer.scrollTo({ left: targetLeft, behavior: "smooth" });
        }
      });
    }

    function scrollToLightboxSection(sIdx) {
      const sec = sectionData[sIdx];
      if (!sec) return;
      const targetItem = track.children[sec.slideIndex];
      if (targetItem) {
        isLightboxNavScrolling = true;
        clearTimeout(navTimeout);
        const itemTop = targetItem.offsetTop - 16;
        scrollWrap.scrollTo({ top: Math.max(0, itemTop), behavior: "smooth" });
        setActiveLightboxPill(sec.id);
        navTimeout = setTimeout(() => {
          isLightboxNavScrolling = false;
        }, 600);
      }
    }

    // Scrollspy for sections inside lightbox
    let lightboxTicking = false;
    function onLightboxScroll() {
      if (isLightboxNavScrolling || !lightbox.classList.contains("is-open")) return;
      if (!lightboxTicking) {
        window.requestAnimationFrame(() => {
          const scrollPos = scrollWrap.scrollTop;
          const triggerLine = scrollPos + scrollWrap.clientHeight * 0.35;
          let activeId = sectionData[0]?.id;

          for (let i = 0; i < sectionData.length; i++) {
            const item = track.children[sectionData[i].slideIndex];
            if (item && item.offsetTop <= triggerLine) {
              activeId = sectionData[i].id;
            }
          }
          if (scrollWrap.scrollHeight - (scrollWrap.scrollTop + scrollWrap.clientHeight) < 40) {
            if (sectionData.length > 0) activeId = sectionData[sectionData.length - 1].id;
          }
          setActiveLightboxPill(activeId);
          lightboxTicking = false;
        });
        lightboxTicking = true;
      }
    }
    scrollWrap.addEventListener("scroll", onLightboxScroll, { passive: true });

    function buildTrack() {
      if (built) return;
      built = true;
      slideImages.forEach((srcImg, idx) => {
        const item = document.createElement("div");
        item.className = "cs-lightbox__item";
        item.dataset.slideIndex = idx;

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
        if (sectionData.length > 0) {
          let currentSec = sectionData[0];
          for (let i = 0; i < sectionData.length; i++) {
            if (sectionData[i].slideIndex <= index) {
              currentSec = sectionData[i];
            }
          }
          setActiveLightboxPill(currentSec.id);
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
    if (backBtn) backBtn.addEventListener("click", closeLightbox);

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
