/* ============================================================
   main.js - Interactions, Lenis Smooth Scroll & PX PUSH Effects
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* Check for ?nofx debug flag */
  if (location.search.indexOf("nofx") !== -1) {
    document.documentElement.classList.add("nofx");
  }

  /* ------------------------------------------------------------
     1. LENIS SMOOTH SCROLLING & GSAP INTEGRATION
     ------------------------------------------------------------ */
  var lenis = null;
  if (!reducedMotion && typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2
    });
    window.lenis = lenis;

    if (typeof window.ScrollTrigger !== "undefined") {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      })(0);
    }
  }

  /* Pause Lenis while preloader is active */
  if (document.body.classList.contains("is-loading") && lenis) {
    lenis.stop();
  }

  /* Smooth anchor scroll */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (href === "#" || href.length < 2) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: 0 });
        else target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ------------------------------------------------------------
     2. SPLITTING.JS INITIALIZATION (Authentic PX PUSH JP helper)
     ------------------------------------------------------------ */
  if (typeof window.Splitting === "function") {
    try {
      window.Splitting({ target: "[data-splitting]:not([data-splitting='lines'])" });

      var lineElements = document.querySelectorAll('[data-splitting="lines"]');
      lineElements.forEach(function (el) {
        var res = window.Splitting({ target: el, by: "lines", whitespace: true });
        if (res && res[0]) {
          var lines = res[0].lines;
          if (lines && lines.length) {
            el.innerHTML = "";
            lines.forEach(function (lineGroup) {
              var lineEl = document.createElement("span");
              lineEl.className = "line";
              var wordsHtml = [];
              lineGroup.forEach(function (w) {
                wordsHtml.push(w.innerHTML !== undefined ? w.innerHTML : w.textContent);
              });
              lineEl.innerHTML = '<span class="line__inner">' + wordsHtml.join(" ") + '</span>';
              el.appendChild(lineEl);
            });
          }
        }
      });
    } catch (e) {
      console.warn("Splitting initialization failed:", e);
    }
  }

  /* ------------------------------------------------------------
     3. GSAP SCROLLTRIGGER EFFECTS (PX PUSH style)
     ------------------------------------------------------------ */
  if (typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined" && !reducedMotion) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    var isMobile = function () {
      return window.innerWidth <= 600 || !!(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i));
    };

    /* ── Authentic PX PUSH Staggered Blinds Overlay Transitions ── */
    var isMob = isMobile();
    var rowsCount = isMob ? 15 : 10;

    // Dynamically populate strip divs inside each overlay (matching pxpush vP)
    document.querySelectorAll(".overlay").forEach(function (overlayEl) {
      if (overlayEl.dataset.overlayReady === "true") return;
      overlayEl.innerHTML = "";
      overlayEl.style.setProperty("--columns", 1);
      for (var i = 0; i < rowsCount; i++) {
        var div = document.createElement("div");
        overlayEl.appendChild(div);
      }
      overlayEl.dataset.overlayReady = "true";
    });

    document.querySelectorAll("[effect__overlayIn]").forEach(function (d) {
      var strips = d.querySelectorAll("div");
      if (!strips.length) return;
      var parentSection = d.closest(".section");

      var triggerEl = d;
      var startPos = "top 0%";
      var endPos = "top -80%";

      if (parentSection && !parentSection.classList.contains("section--hero")) {
        triggerEl = parentSection;
        startPos = "bottom 100%";
        endPos = "bottom 20%";
      }

      gsap.fromTo(strips, {
        willChange: "opacity, transform",
        transformOrigin: "50% 100%",
        opacity: 1,
        scaleY: 0
      }, {
        ease: "power4",
        scaleY: 1.01,
        opacity: 1,
        stagger: {
          grid: [rowsCount, 1],
          from: "end",
          each: 0.04
        },
        scrollTrigger: {
          trigger: triggerEl,
          scroller: window,
          start: startPos,
          end: endPos,
          scrub: true
        }
      });
    });

    /* effect__titleRandom (3D perspective rotation + random scramble into view) */
    document.querySelectorAll("[effect__titleRandom]").forEach(function (el) {
      var isSmall = el.getAttribute("data-small") === "true";
      var items = el.querySelectorAll(".word, .line__inner");
      var targets = items.length ? items : [el];
      targets.forEach(function (p) {
        if (p.parentNode) gsap.set(p.parentNode, { perspective: 1000 });
      });

      gsap.fromTo(targets, {
        willChange: "opacity, transform",
        transformOrigin: "50% 100%",
        opacity: 0,
        z: -100,
        rotationX: -40
      }, {
        ease: "power4",
        opacity: 1,
        stagger: { each: 0.03, from: "random" },
        rotationX: 0,
        z: 0,
        scrollTrigger: {
          trigger: el,
          scroller: window,
          start: "top 90%",
          end: isSmall ? "top 50%" : "top 0%",
          scrub: true
        }
      });
    });

    /* effect__textFade (scrubbed word opacity fade-in) */
    document.querySelectorAll("[effect__textFade]").forEach(function (el) {
      var words = el.querySelectorAll(".word, .line__inner");
      var targets = words.length ? words : [el];
      gsap.fromTo(targets, {
        willChange: "opacity",
        opacity: 0.1
      }, {
        ease: "none",
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          scroller: window,
          start: "top 80%",
          end: isMobile() ? "center top+=10%" : "bottom 80%",
          scrub: true
        }
      });
    });

    /* effect__titleIn (3D character tilt and rotate into view) */
    document.querySelectorAll("[effect__titleIn]").forEach(function (el) {
      var chars = el.querySelectorAll(".char");
      var targets = chars.length ? chars : [el];
      targets.forEach(function (g) {
        if (g.parentNode) gsap.set(g.parentNode, { perspective: 1000 });
      });

      gsap.fromTo(targets, {
        willChange: "opacity, transform",
        transformOrigin: "50% 0%",
        opacity: 0,
        rotationX: -30,
        z: -200
      }, {
        ease: "power1",
        opacity: 1,
        stagger: 0.05,
        rotationX: 0,
        z: 0,
        scrollTrigger: {
          trigger: el,
          scroller: window,
          start: "top 90%",
          end: "top 40%",
          scrub: true
        }
      });
    });

    /* Hero entrance typography reveal */
    var heroLines = document.querySelectorAll(".heading__text .line__inner, .hero__note .line__inner");
    if (heroLines.length && typeof window.gsap !== "undefined") {
      window.gsap.set(heroLines, {
        yPercent: 100,
        opacity: 0
      });
    }

    var triggerHeroEntrance = function () {
      if (heroLines && heroLines.length && typeof window.gsap !== "undefined") {
        window.gsap.to(heroLines, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          delay: 0.1
        });
      }
    };

    /* effect__fadeOutVideo (hero video/canvas scale and fade on scroll) */
    document.querySelectorAll("[effect__fadeOutVideo]").forEach(function (el) {
      gsap.fromTo(el, {
        willChange: "opacity, transform",
        opacity: 1,
        yPercent: 0
      }, {
        ease: "none",
        opacity: 0,
        yPercent: 50,
        scrollTrigger: {
          trigger: el,
          scroller: window,
          start: "top top",
          end: "top -100%",
          scrub: true
        }
      });
    });

    /* effect__fadeOut (blur & fade out for hero elements on scroll) */
    document.querySelectorAll("[effect__fadeOut]").forEach(function (el) {
      gsap.fromTo(el, {
        willChange: "opacity, filter",
        opacity: 1,
        filter: "blur(0px)"
      }, {
        ease: "none",
        opacity: 0,
        filter: "blur(20px)",
        scrollTrigger: {
          trigger: el,
          scroller: window,
          start: "top 5%",
          end: "top -30%",
          scrub: true
        }
      });
    });

    /* topOverlay__section (soft gradient vignette when scrolling through sections) */
    document.querySelectorAll(".topOverlay__section").forEach(function (d) {
      var f = d.closest("section") || d.parentElement;
      if (f) {
        ScrollTrigger.create({
          trigger: f,
          scroller: window,
          start: "top 5%",
          end: "bottom 20%",
          onEnter: function () { d.classList.add("is-visible"); },
          onLeave: function () { d.classList.remove("is-visible"); },
          onEnterBack: function () { d.classList.add("is-visible"); },
          onLeaveBack: function () { d.classList.remove("is-visible"); }
        });
      }
    });

    /* effect__separatorIn (sticky horizontal rule clip-path reveal) */
    document.querySelectorAll("[effect__separatorIn]").forEach(function (el) {
      gsap.fromTo(el, {
        willChange: "clip-path",
        clipPath: "inset(0 100vw 0 0)"
      }, {
        ease: "none",
        clipPath: "inset(0 0vw 0 0)",
        scrollTrigger: {
          trigger: el,
          scroller: window,
          start: "top 95%",
          end: "top 65%",
          scrub: true
        }
      });
    });

    /* effect__parallax (footer parallax scrub) */
    document.querySelectorAll("[effect__parallax]").forEach(function (el) {
      var isTop = el.classList.contains("top");
      var amt = parseFloat(el.getAttribute("data-parallax") || "35");
      gsap.fromTo(el, {
        willChange: "opacity, transform",
        opacity: 1,
        yPercent: 0
      }, {
        ease: "none",
        opacity: 1,
        yPercent: -amt,
        scrollTrigger: {
          trigger: el,
          scroller: window,
          start: isTop ? "top top" : "top bottom",
          end: isTop ? "bottom top" : "bottom -60%",
          scrub: true
        }
      });
    });

    /* TopOverlay section sticky header transitions */
    document.querySelectorAll(".topOverlay__section").forEach(function (el) {
      ScrollTrigger.create({
        trigger: el.parentElement,
        scroller: window,
        start: "top 25%",
        end: "bottom 25%",
        onEnter: function () { el.classList.add("is-visible"); },
        onLeave: function () { el.classList.remove("is-visible"); },
        onEnterBack: function () { el.classList.add("is-visible"); },
        onLeaveBack: function () { el.classList.remove("is-visible"); }
      });
    });
  }

  /* ------------------------------------------------------------
     4. MARQUEE VELOCITY & SPEED MULTIPLIER
     ------------------------------------------------------------ */
  var speedMultiplier = 1;
  var scrollVel = 0;
  var lastScrollY = window.scrollY;

  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    scrollVel += Math.abs(y - lastScrollY);
    lastScrollY = y;
  }, { passive: true });

  document.querySelectorAll(".speed").forEach(function (el) {
    var cycle = function () {
      speedMultiplier = speedMultiplier >= 4 ? 1 : speedMultiplier * 2;
      el.innerHTML = "<span class='line__inner'>SPEED ×" + speedMultiplier + "</span>";
    };
    el.addEventListener("click", cycle);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cycle(); }
    });
  });

  var marquees = [];
  document.querySelectorAll("[data-marquee]").forEach(function (mq) {
    var track = mq.querySelector(".marqueeText__track");
    if (!track || !track.children.length) return;
    var guard = 0;
    while (track.scrollWidth < window.innerWidth * 3 && guard++ < 30) {
      track.appendChild(track.children[0].cloneNode(true));
    }
    marquees.push({
      track: track,
      x: 0,
      half: track.scrollWidth / 2 || 1,
      base: parseFloat(mq.dataset.baseSpeed || "1")
    });
  });

  var measureMarquees = function () {
    marquees.forEach(function (m) {
      m.half = m.track.scrollWidth / 2 || 1;
    });
  };
  window.addEventListener("resize", measureMarquees);

  /* ------------------------------------------------------------
     5. SHOWCASE: HOLD-TO-SKIM & VELOCITY LOOP
     ------------------------------------------------------------ */
  var showcases = [];
  var skimCursor = document.getElementById("skimCursor") || document.querySelector(".homeworks__skimCursor");

  document.querySelectorAll("[data-showcase]").forEach(function (sc) {
    var loop = sc.querySelector(".showcase__loop");
    if (!loop) return;

    var state = {
      sc: sc,
      loop: loop,
      x: 0,
      half: 1,
      speed: 0.95,
      vel: 0,
      isHolding: false,
      holdStartTime: 0,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      dragDist: 0,
      isTouch: false
    };

    var originals = Array.prototype.slice.call(loop.children);
    var build = function () {
      var unitW = loop.scrollWidth;
      if (!unitW) return;
      var need = Math.ceil((window.innerWidth * 3) / unitW) + 1;
      for (var r = 1; r < Math.max(2, need); r++) {
        originals.forEach(function (child) {
          loop.appendChild(child.cloneNode(true));
        });
      }
      state.half = loop.scrollWidth / 2;
    };
    build();
    window.addEventListener("resize", build);
    showcases.push(state);

    var updateSkimText = function (text) {
      if (!skimCursor) return;
      var textEl = skimCursor.querySelector(".skimCursor__text");
      if (textEl) textEl.textContent = text;
      else skimCursor.textContent = text;
    };

    var updateCursorPos = function (cx, cy) {
      if (!skimCursor) return;
      var scale = state.isHolding ? " scale(1.12)" : " scale(1)";
      skimCursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0) translate(-50%,-50%)" + scale;
    };

    var isPointerInside = false;

    sc.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch") return;
      isPointerInside = true;
      if (skimCursor) {
        updateCursorPos(e.clientX, e.clientY);
        updateSkimText(state.isHolding ? "Skimming >>" : "Hold to skim");
        skimCursor.style.opacity = "1";
      }
    });

    sc.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      isPointerInside = false;
      if (!state.isHolding && skimCursor) {
        skimCursor.style.opacity = "0";
      }
    });

    var onPointerMove = function (e) {
      if (e.pointerType !== "touch" && (isPointerInside || state.isHolding)) {
        updateCursorPos(e.clientX, e.clientY);
      }
      if (!state.isHolding) return;

      var dx = e.clientX - state.lastX;
      var dy = e.clientY - state.lastY;
      state.dragDist += Math.abs(dx) + Math.abs(dy);

      // Direct tactile scrub with finger or mouse drag
      state.x += dx * 1.5;
      state.vel = -dx * 0.35;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    };

    var onPointerUp = function (e) {
      if (!state.isHolding) return;

      var duration = Date.now() - state.holdStartTime;
      var wasDragOrHold = duration > 240 || state.dragDist > 14;

      state.isHolding = false;
      sc.classList.remove("is-holding");

      if (skimCursor) {
        skimCursor.classList.remove("is-holding");
        updateSkimText("Hold to skim");
        if (!isPointerInside || state.isTouch) {
          skimCursor.style.opacity = "0";
        } else {
          updateCursorPos(e.clientX, e.clientY);
        }
      }

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      // If user tapped/clicked quickly without dragging, navigate to the case study!
      if (!wasDragOrHold && e.clientX && e.clientY) {
        var hit = document.elementFromPoint(e.clientX, e.clientY);
        var card = hit ? hit.closest(".showcase__item") : null;
        if (card) {
          var link = card.getAttribute("data-link") || (card.querySelector("a") ? card.querySelector("a").href : null);
          if (link) {
            window.open(link, "_blank", "noopener,noreferrer");
          }
        }
      }
    };

    sc.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      state.isHolding = true;
      state.isTouch = e.pointerType === "touch";
      state.holdStartTime = Date.now();
      state.startX = e.clientX;
      state.startY = e.clientY;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      state.dragDist = 0;

      sc.classList.add("is-holding");

      if (skimCursor && !state.isTouch) {
        skimCursor.classList.add("is-holding");
        updateSkimText("Skimming >>");
        skimCursor.style.opacity = "1";
        updateCursorPos(e.clientX, e.clientY);
      }

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    });

    // Also track pointermove when simply hovering without holding
    sc.addEventListener("pointermove", function (e) {
      if (!state.isHolding && e.pointerType !== "touch") {
        updateCursorPos(e.clientX, e.clientY);
      }
    }, { passive: true });

    // Prevent default browser drag on card images and link navigation when holding
    sc.querySelectorAll("img, a").forEach(function (el) {
      el.addEventListener("dragstart", function (e) { e.preventDefault(); });
      el.addEventListener("click", function (e) {
        var duration = Date.now() - state.holdStartTime;
        if (state.dragDist > 14 || duration > 240) {
          e.preventDefault();
        }
      });
    });
  });

  /* ------------------------------------------------------------
     6. SERVICES ACCORDION
     ------------------------------------------------------------ */
  var accRows = document.querySelectorAll("[data-acc-row]");
  var openRow = function (row) {
    accRows.forEach(function (r) { r.classList.toggle("is-open", r === row); });
  };
  accRows.forEach(function (row) {
    row.addEventListener("click", function () { openRow(row); });
    if (finePointer) row.addEventListener("mouseenter", function () { openRow(row); });
  });
  if (accRows.length) openRow(accRows[accRows.length - 1]);

  /* ------------------------------------------------------------
     7. MINI SHOWREEL CARD FADE & MODAL
     ------------------------------------------------------------ */
  var miniCard = document.querySelector("[data-mini]");
  var heroSection = document.getElementById("hero");
  if (heroSection && miniCard) {
    window.addEventListener("scroll", function () {
      var rect = heroSection.getBoundingClientRect();
      var past = rect.bottom < window.innerHeight * 0.45;
      miniCard.classList.toggle("is-released", past);
    }, { passive: true });
  }

  var openVideoBtn = document.getElementById("openVideoBtn");
  var closeVideoBtn = document.getElementById("closeVideoBtn");
  var videoOverlay = document.getElementById("videoOverlay");
  var overlayVideo = document.getElementById("overlayVideo");

  function openVideoModal() {
    if (!videoOverlay) return;
    videoOverlay.style.display = "flex";
    videoOverlay.offsetHeight;
    videoOverlay.classList.add("is-open");
    videoOverlay.setAttribute("aria-hidden", "false");
    if (overlayVideo && overlayVideo.src && overlayVideo.style.display !== "none") {
      overlayVideo.currentTime = 0;
      overlayVideo.play().catch(function () {});
    }
  }

  function closeVideoModal() {
    if (!videoOverlay) return;
    videoOverlay.classList.remove("is-open");
    videoOverlay.setAttribute("aria-hidden", "true");
    setTimeout(function () {
      if (!videoOverlay.classList.contains("is-open")) {
        videoOverlay.style.display = "none";
      }
    }, 300);
    if (overlayVideo) {
      overlayVideo.pause();
    }
  }

  if (openVideoBtn) openVideoBtn.addEventListener("click", openVideoModal);
  if (closeVideoBtn) closeVideoBtn.addEventListener("click", closeVideoModal);
  if (videoOverlay) {
    videoOverlay.addEventListener("click", function (e) {
      if (e.target === videoOverlay || e.target.classList.contains("homeVideoOverlay__stage")) {
        closeVideoModal();
      }
    });
  }
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && videoOverlay && videoOverlay.classList.contains("is-open")) {
      closeVideoModal();
    }
  });



  /* ------------------------------------------------------------
     8. FOOTER WORDMARK TRAIL (Scroll-driven ripple expansion)
     ------------------------------------------------------------ */
  function initFooterTrail() {
    var stack = document.querySelector(".footer__logoStack");
    if (!stack) return;

    function update() {
      var rect = stack.getBoundingClientRect();
      var winH = window.innerHeight || document.documentElement.clientHeight;

      // Animation begins when the logo enters the lower viewport and completes in the upper view
      var startY = winH * 0.95;
      var endY = winH * 0.30;
      var raw = (startY - rect.top) / (startY - endY);
      var progress = Math.max(0, Math.min(1, raw));

      // Crop smoothly opens from 90% down to 42% revealing the wave slices
      var crop = 90 - progress * 48;

      stack.style.setProperty("--trail-progress", progress.toFixed(4));
      stack.style.setProperty("--trail-crop", crop.toFixed(2) + "%");
    }

    if (lenis) {
      lenis.on("scroll", update);
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }
  initFooterTrail();

  /* ------------------------------------------------------------
     9. GMT CLOCK
     ------------------------------------------------------------ */
  var clock = document.querySelector("[data-clock]");
  var tickClock = function () {
    if (!clock) return;
    var off = -new Date().getTimezoneOffset();
    var sign = off >= 0 ? "+" : "-";
    var abs = Math.abs(off);
    var hh = String(Math.floor(abs / 60)).padStart(2, "0");
    var mm = String(abs % 60).padStart(2, "0");
    clock.textContent = "GMT " + sign + hh + ":" + mm;
  };
  tickClock();
  setInterval(tickClock, 30000);

  /* ------------------------------------------------------------
     10. MOBILE NAVIGATION
     ------------------------------------------------------------ */
  var menuBtn = document.querySelector("header .menu");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu_open");
      menuBtn.textContent = open ? "Close" : "Menu";
    });
    document.querySelectorAll(".mobilenav a, .mobilenav__backdrop").forEach(function (el) {
      el.addEventListener("click", function () {
        document.body.classList.remove("menu_open");
        menuBtn.textContent = "Menu";
      });
    });
  }

  /* ------------------------------------------------------------
     11. PIXEL GRID CURSOR & PRECISION POINTER (Authentic PX PUSH)
     ------------------------------------------------------------ */
  var cursorEl = document.querySelector(".cursor");
  var cursorDot = document.getElementById("cursorDot");
  if (cursorEl && !reducedMotion) {
    var ju = { x: -9999, y: -9999 };
    var dotX = -9999, dotY = -9999;
    var targetDotX = -9999, targetDotY = -9999;

    var onPointerMove = function (e) {
      ju.x = e.clientX;
      ju.y = e.clientY;
      targetDotX = e.clientX;
      targetDotY = e.clientY;
      if (cursorDot) {
        cursorDot.classList.add("is-active");
      }
    };
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Interactive element hover scale for cursor dot
    document.addEventListener("mouseover", function (e) {
      if (!cursorDot) return;
      if (e.target && e.target.closest && e.target.closest("a, button, .button, [role='button'], input, textarea, .speed")) {
        cursorDot.classList.add("is-hovering");
      } else {
        cursorDot.classList.remove("is-hovering");
      }
    }, { passive: true });

    // Smooth cursor dot RAF follower
    (function updateDot() {
      if (cursorDot && targetDotX > -1000) {
        dotX += (targetDotX - dotX) * 0.45;
        dotY += (targetDotY - dotY) * 0.45;
        cursorDot.style.transform = "translate3d(" + dotX.toFixed(1) + "px," + dotY.toFixed(1) + "px,0) translate(-50%,-50%)";
      }
      requestAnimationFrame(updateDot);
    })();

    var PixelCursor = function (el) {
      this.el = el;
      this.inner = el.querySelector(".cursor__inner");
      if (this.inner) this.inner.style.filter = "url(#gooey)";
      this.ttl = parseFloat(el.getAttribute("data-ttl")) || 0.22;
      this.cachedCell = null;
      this.layout();
      this.initEvents();
    };

    PixelCursor.prototype.layout = function () {
      this.columns = parseInt(getComputedStyle(this.el).getPropertyValue("--columns")) || 24;
      this.cellSize = window.innerWidth / this.columns;
      this.rows = Math.ceil(window.innerHeight / this.cellSize);
      this.cellsTotal = this.rows * this.columns;
      this.inner.style.gridTemplateColumns = "repeat(" + this.columns + ", " + this.cellSize + "px)";
      this.inner.innerHTML = "";
      var html = "";
      for (var s = 0; s < this.cellsTotal; ++s) {
        html += '<div class="cursor__inner-box" style="width:' + this.cellSize + 'px;height:' + this.cellSize + 'px;"></div>';
      }
      this.inner.innerHTML = html;
      this.cells = this.inner.children;
    };

    PixelCursor.prototype.getCellAtCursor = function (x, y) {
      var cx = (x !== undefined && !isNaN(x)) ? x : ju.x;
      var cy = (y !== undefined && !isNaN(y)) ? y : ju.y;
      var col = Math.floor(cx / this.cellSize);
      var row = Math.floor(cy / this.cellSize);
      var n = row * this.columns + col;
      if (n >= this.cellsTotal || n < 0 || col < 0 || col >= this.columns) {
        return null;
      }
      return this.cells[n];
    };

    PixelCursor.prototype.initEvents = function () {
      var self = this;
      window.addEventListener("resize", function () {
        self.layout();
      });

      var triggerCell = function (e) {
        var cell = self.getCellAtCursor(e ? e.clientX : undefined, e ? e.clientY : undefined);
        if (!cell || self.cachedCell === cell) return;
        self.cachedCell = cell;
        if (window.gsap) {
          window.gsap.killTweensOf(cell);
          window.gsap.set(cell, { opacity: 1 });
          window.gsap.to(cell, { opacity: 0, duration: 0.38, delay: self.ttl, ease: "power1.out" });
        }
      };

      window.addEventListener("mousemove", triggerCell, { passive: true });
      window.addEventListener("pointermove", triggerCell, { passive: true });
    };

    new PixelCursor(cursorEl);
  }

  /* ------------------------------------------------------------
     12. HERO PARALLAX & VIDEO INTERACTION
     ------------------------------------------------------------ */
  function initHeroParallax() {
    // Hero background video
    var heroVideo = document.getElementById("heroVideo");
    if (heroVideo) {
      heroVideo.muted = true;
      var playP = heroVideo.play();
      if (playP !== undefined) {
        playP.catch(function () {
          window.addEventListener("pointerdown", function () {
            if (heroVideo.paused) heroVideo.play().catch(function () {});
          }, { once: true });
        });
      }
    }

    // Mouse Tracking for Hero Parallax
    var targetCamX = 0, targetCamY = 0;
    var centerScreenX = window.innerWidth / 2;
    var centerScreenY = window.innerHeight / 2;

    var isSpeedHovered = false;
    var cover = document.querySelector(".canvas__cover");

    window.addEventListener("mousemove", function (e) {
      targetCamX = (e.clientX - centerScreenX) * 0.22;
      targetCamY = (e.clientY - centerScreenY) * 0.15;

      var hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
      var onSpeed = !!(hoveredEl && hoveredEl.closest && hoveredEl.closest(".speed"));
      if (onSpeed !== isSpeedHovered) {
        isSpeedHovered = onSpeed;
        if (cover) cover.style.opacity = isSpeedHovered ? "1" : "0";
        if (heroVideo) heroVideo.playbackRate = isSpeedHovered ? 2.5 : 1.0;
      }
    }, { passive: true });

    // Multi-plane parallax on hero typography
    var typoTitle = document.querySelector(".heading__text--title");
    var typoSub = document.querySelector(".heading__text--subtitle");
    var typoNote = document.querySelector(".hero__note");
    var curTypoX = 0, curTypoY = 0;
    var tgtTypoX = 0, tgtTypoY = 0;

    window.addEventListener("mousemove", function (e) {
      tgtTypoX = ((e.clientX / window.innerWidth) - 0.5) * 28;
      tgtTypoY = ((e.clientY / window.innerHeight) - 0.5) * 20;
    }, { passive: true });

    // Visibility observer to pause rendering when out of viewport
    var isSceneVisible = true;
    var heroSection = document.getElementById("hero");
    if (heroSection && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        isSceneVisible = entries[0].isIntersecting;
      }).observe(heroSection);
    }

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      if (!isSceneVisible) return;

      // Parallax typography interpolation
      curTypoX += (tgtTypoX - curTypoX) * 0.04;
      curTypoY += (tgtTypoY - curTypoY) * 0.04;
      if (typoTitle) typoTitle.style.transform = "translate3d(" + (curTypoX * 0.8).toFixed(2) + "px, " + (curTypoY * 0.8).toFixed(2) + "px, 0)";
      if (typoSub) typoSub.style.transform = "translate3d(" + (curTypoX * 1.5).toFixed(2) + "px, " + (curTypoY * 1.5).toFixed(2) + "px, 0)";
      if (typoNote) typoNote.style.transform = "translate3d(" + (curTypoX * 0.4).toFixed(2) + "px, " + (curTypoY * 0.4).toFixed(2) + "px, 0)";

      // Background clouds video parallax
      if (heroVideo) {
        heroVideo.style.transform = "scale(1.06) translate3d(" + (-targetCamX * 0.05).toFixed(1) + "px, " + (targetCamY * 0.05).toFixed(1) + "px, 0)";
      }
    }
    requestAnimationFrame(animate);

    // Resize handler
    window.addEventListener("resize", function () {
      centerScreenX = window.innerWidth / 2;
      centerScreenY = window.innerHeight / 2;
    }, { passive: true });
  }

  if (!reducedMotion) {
    initHeroParallax();
  }

  /* ------------------------------------------------------------
     12b. 3D REVOLVING RISHI EMBLEM (THREE.JS)
     ------------------------------------------------------------ */
  function initHero3DModel() {
    var canvas = document.getElementById("hero3dCanvas");
    var container = document.getElementById("hero3dContainer");
    if (!canvas || !container || typeof window.THREE === "undefined") return;

    var THREE = window.THREE;
    var width = container.clientWidth || 600;
    var height = container.clientHeight || 450;

    // Scene
    var scene = new THREE.Scene();

    // Telephoto Perspective Camera matching pxpush.com (FOV: 10 at distance: 13 for isometric architectural view)
    var camera = new THREE.PerspectiveCamera(10, width / height, 0.1, 100);
    camera.position.set(0, 0, 13);

    // Renderer
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Studio Environment Reflections
    if (typeof window.RoomEnvironment !== "undefined" || THREE.RoomEnvironment) {
      try {
        var RoomEnv = window.RoomEnvironment || THREE.RoomEnvironment;
        var pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        scene.environment = pmremGenerator.fromScene(new RoomEnv(), 0.04).texture;
      } catch (err) {
        console.warn("RoomEnvironment init failed, using directional lights:", err);
      }
    }

    // Dynamic Lighting rig matching pxpush studio with enhanced contrast
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    var keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(3, 4, 8);
    scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0xa8d8ff, 0.9);
    fillLight.position.set(-4, -1, 6);
    scene.add(fillLight);

    var backLight = new THREE.DirectionalLight(0xffffff, 1.3);
    backLight.position.set(0, 2, -8);
    scene.add(backLight);

    // Root group for multi-axis rotation and tilt
    var modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Mesh pivot for precise center alignment
    var meshPivot = new THREE.Group();
    modelGroup.add(meshPivot);

    // State for revolving and interactive tilt
    var baseRevolvingSpeed = 0.0075; // Continuous revolution from front towards right
    var currentRevolvingAngle = 0; // Starts clean front-facing
    var extraSpinVelocity = 0;
    var scrollSpinVelocity = 0;
    var targetScrollSpin = 0;
    var isAutoRevolving = true;
    var targetTiltX = 0, targetTiltY = 0;
    var currentTiltX = 0, currentTiltY = 0;
    var isDragging = false;
    var lastDragX = 0, dragStartY = 0;
    var isModelLoaded = false;
    var modelBoundingSize = null;

    // Exact frustum fitting calculation with bolder heroic scale
    function updateModelScale() {
      if (!meshPivot || !modelBoundingSize) return;
      var w = container.clientWidth || (window.innerWidth * 0.72);
      var h = container.clientHeight || (window.innerHeight * 0.38);
      var vFovRad = THREE.MathUtils.degToRad(camera.fov / 2);
      var visibleHeight = 2 * camera.position.z * Math.tan(vFovRad);
      var visibleWidth = visibleHeight * (w / h);
      var scale = Math.min((visibleWidth * 0.90) / modelBoundingSize.x, (visibleHeight * 0.92) / modelBoundingSize.y);
      meshPivot.scale.setScalar(scale);
    }

    // Scroll velocity reaction matching scroll direction
    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: function (self) {
          var v = self.getVelocity();
          targetScrollSpin = THREE.MathUtils.clamp(v * 2e-5, -0.08, 0.08);
        }
      });
    } else {
      var lastScrollY = window.scrollY;
      var lastScrollTime = performance.now();
      window.addEventListener("scroll", function () {
        var now = performance.now();
        var dt = Math.max(1, now - lastScrollTime);
        var dy = window.scrollY - lastScrollY;
        var v = (dy / dt) * 1000;
        lastScrollY = window.scrollY;
        lastScrollTime = now;
        targetScrollSpin = Math.max(-0.08, Math.min(0.08, v * 2e-5));
      }, { passive: true });
    }

    window.__hero3d = {
      modelGroup: modelGroup,
      scene: scene,
      renderer: renderer,
      camera: camera,
      setAngle: function (a) { currentRevolvingAngle = a; },
      pause: function () { isAutoRevolving = false; },
      play: function () { isAutoRevolving = true; }
    };

    // Load Poliigon Brushed Steel PBR Material
    var texLoader = new THREE.TextureLoader();
    function createBrushedSteelMaterial() {
      var baseColor = texLoader.load("assets/model/textures/brushed_steel/Poliigon_MetalSteelBrushed_7174_BaseColor_2k.webp", undefined, undefined, function () {
        baseColor = texLoader.load("assets/model/textures/brushed_steel/Poliigon_MetalSteelBrushed_7174_BaseColor_2k.jpg");
      });
      var roughness = texLoader.load("assets/model/textures/brushed_steel/Poliigon_MetalSteelBrushed_7174_Roughness_2k.webp", undefined, undefined, function () {
        roughness = texLoader.load("assets/model/textures/brushed_steel/Poliigon_MetalSteelBrushed_7174_Roughness_2k.jpg");
      });
      var metallic = texLoader.load("assets/model/textures/brushed_steel/Poliigon_MetalSteelBrushed_7174_Metallic_2k.webp", undefined, undefined, function () {
        metallic = texLoader.load("assets/model/textures/brushed_steel/Poliigon_MetalSteelBrushed_7174_Metallic_2k.jpg");
      });
      var normal = texLoader.load("assets/model/textures/brushed_steel/Poliigon_MetalSteelBrushed_7174_Normal_2k.png");
      var ao = texLoader.load("assets/model/textures/brushed_steel/Poliigon_MetalSteelBrushed_7174_AmbientOcclusion_2k.webp", undefined, undefined, function () {
        ao = texLoader.load("assets/model/textures/brushed_steel/Poliigon_MetalSteelBrushed_7174_AmbientOcclusion_2k.jpg");
      });

      [baseColor, roughness, metallic, normal, ao].forEach(function (tex) {
        if (tex) {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        }
      });

      return new THREE.MeshPhysicalMaterial({
        map: baseColor,
        roughnessMap: roughness,
        metalnessMap: metallic,
        normalMap: normal,
        normalScale: new THREE.Vector2(0.8, 0.8),
        aoMap: ao,
        aoMapIntensity: 0.95,
        color: new THREE.Color(0x464e57),
        metalness: 0.95,
        roughness: 0.28,
        clearcoat: 0.7,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.95
      });
    }

    // Center and prepare loaded mesh with brushed steel finish
    function onModelLoaded(object) {
      // Find actual mesh inside object to compute precise unscaled geometry bounding size
      var mesh = null;
      object.traverse(function (child) {
        if (child.isMesh && !mesh) mesh = child;
      });
      if (mesh) {
        mesh.geometry.computeBoundingBox();
        var bb = mesh.geometry.boundingBox;
        modelBoundingSize = new THREE.Vector3();
        bb.getSize(modelBoundingSize);
        var center = new THREE.Vector3();
        bb.getCenter(center);
        mesh.geometry.translate(-center.x, -center.y, -center.z);
        mesh.geometry.computeVertexNormals();
      } else {
        var box = new THREE.Box3().setFromObject(object);
        var center = box.getCenter(new THREE.Vector3());
        modelBoundingSize = box.getSize(new THREE.Vector3());
        object.position.set(-center.x, -center.y, -center.z);
      }

      // Frustum fit matching pxpush lt()
      updateModelScale();

      // Apply authentic brushed steel PBR material
      var brushedMaterial = createBrushedSteelMaterial();
      object.traverse(function (child) {
        if (child.isMesh) {
          child.material = brushedMaterial;
          child.material.needsUpdate = true;
        }
      });

      meshPivot.add(object);
      isModelLoaded = true;

      // Initial placement & rotation
      modelGroup.position.set(0, 0, 0);
      modelGroup.rotation.set(0, 0, 0);

      // Smooth entrance scale
      modelGroup.scale.set(0.001, 0.001, 0.001);
      if (window.gsap) {
        window.gsap.to(modelGroup.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.4,
          ease: "power3.out"
        });
      } else {
        modelGroup.scale.set(1, 1, 1);
      }
    }

    // Try loading optimized GLB first, then fallback to OBJ
    var gltfLoaded = false;
    if (typeof THREE.GLTFLoader !== "undefined") {
      var gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load(
        "assets/model/rishi_emblem_opt.glb",
        function (gltf) {
          gltfLoaded = true;
          onModelLoaded(gltf.scene);
        },
        undefined,
        function (err) {
          console.warn("GLTF load failed, attempting OBJ fallback:", err);
          loadOBJFallback();
        }
      );
    } else {
      loadOBJFallback();
    }

    function loadOBJFallback() {
      if (gltfLoaded || typeof THREE.OBJLoader === "undefined") return;
      var objLoader = new THREE.OBJLoader();
      objLoader.load(
        "assets/model/Meshy_AI_Metallic_Rishi_Emblem_0929095700_texture.obj",
        function (obj) {
          var mat = createBrushedSteelMaterial();
          obj.traverse(function (child) {
            if (child.isMesh) {
              child.material = mat;
            }
          });
          onModelLoaded(obj);
        },
        undefined,
        function (err) {
          console.error("OBJ load fallback failed:", err);
        }
      );
    }

    // Interactive mouse movement tilt
    window.addEventListener("mousemove", function (e) {
      if (isDragging) return;
      var normX = (e.clientX / window.innerWidth) - 0.5;
      var normY = (e.clientY / window.innerHeight) - 0.5;
      targetTiltY = normX * 0.45;
      targetTiltX = normY * 0.35;
    }, { passive: true });

    // Drag / Touch to spin with momentum (bound to hero banner so pointer-events: none on container works)
    var heroBanner = document.querySelector(".banner__hero") || window;
    heroBanner.addEventListener("pointerdown", function (e) {
      if (e.target && e.target.closest && e.target.closest("button, a, .homeMiniVideo, .speed")) return;
      isDragging = true;
      lastDragX = e.clientX;
      dragStartY = e.clientY;
      extraSpinVelocity = 0;
    });

    window.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      var deltaX = e.clientX - lastDragX;
      lastDragX = e.clientX;
      currentRevolvingAngle += deltaX * 0.015;
      extraSpinVelocity = deltaX * 0.008;

      var deltaY = e.clientY - dragStartY;
      targetTiltX = Math.max(-0.6, Math.min(0.6, deltaY * 0.005));
    }, { passive: true });

    window.addEventListener("pointerup", function () {
      isDragging = false;
    });
    window.addEventListener("pointercancel", function () {
      isDragging = false;
    });

    // Visibility Observer to pause rendering when scrolled away
    var isHeroVisible = true;
    var heroElem = document.getElementById("hero");
    if (heroElem && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        isHeroVisible = entries[0].isIntersecting;
      }).observe(heroElem);
    }

    // Render Loop with frame-rate independent delta timing and scroll velocity spring momentum
    var clock = new THREE.Clock();
    function render3D() {
      requestAnimationFrame(render3D);
      if (!isHeroVisible || !isModelLoaded) {
        if (clock.running) clock.getDelta();
        return;
      }

      var delta = Math.min(clock.getDelta(), 0.1);
      var timeFactor = delta * 60; // 1.0 at 60fps, 0.5 at 120fps

      // Scroll spin decay & spring interpolation
      targetScrollSpin *= Math.pow(0.90, timeFactor);
      scrollSpinVelocity += (targetScrollSpin - scrollSpinVelocity) * (1 - Math.pow(1 - 0.16, timeFactor));

      // Base continuous revolving motion + scroll spin + drag spin
      extraSpinVelocity *= Math.pow(0.94, timeFactor);
      if (isAutoRevolving) {
        currentRevolvingAngle += (baseRevolvingSpeed + scrollSpinVelocity + extraSpinVelocity) * timeFactor;
      }

      // Smooth tilt interpolation
      currentTiltX += (targetTiltX - currentTiltX) * (1 - Math.pow(1 - 0.06, timeFactor));
      currentTiltY += (targetTiltY - currentTiltY) * (1 - Math.pow(1 - 0.06, timeFactor));

      // Apply rotations: revolving on Y, tilting on X and Z
      modelGroup.rotation.x = currentTiltX;
      modelGroup.rotation.y = currentRevolvingAngle + currentTiltY * 0.45;
      modelGroup.rotation.z = -currentTiltY * 0.25;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(render3D);

    // Resize Handler with responsive frustum scaling
    function onResize() {
      if (!container || !renderer || !camera) return;
      var w = container.clientWidth || (window.innerWidth * 0.72);
      var h = container.clientHeight || (window.innerHeight * 0.38);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      updateModelScale();
    }
    window.addEventListener("resize", onResize, { passive: true });
  }

  // Initialize 3D Hero Model
  initHero3DModel();

  /* ------------------------------------------------------------
     12.b ABOUT WALKMAN 3D MODEL & INTERACTIVE HOT LINE BUTTON
     ------------------------------------------------------------ */
  function initAboutWalkman() {
    var canvas = document.getElementById("aboutWalkmanCanvas");
    var stage = document.getElementById("aboutWalkmanStage");
    var aboutSection = document.getElementById("about");

    if (!canvas || !stage || typeof window.THREE === "undefined") return;

    var THREE = window.THREE;
    var width = stage.clientWidth || 400;
    var height = stage.clientHeight || 560;

    // Web Audio Synthesizer for tactile mechanical cassette switch clicks
    var audioCtx = null;
    function playCassetteSwitch(isRelease) {
      try {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) audioCtx = new AudioContextClass();
        if (audioCtx.state === "suspended") audioCtx.resume();

        var now = audioCtx.currentTime;

        // Layer 1: Metallic transient snap (bandpass noise)
        var bufferSize = Math.floor(audioCtx.sampleRate * 0.022);
        var noiseBuf = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var out = noiseBuf.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
          out[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
        }
        var noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuf;

        var filter = audioCtx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(isRelease ? 2400 : 3200, now);
        filter.Q.setValueAtTime(5.0, now);

        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(now);

        // Layer 2: Mechanical latch click (pitch-drop transient)
        var osc = audioCtx.createOscillator();
        var oscGain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(isRelease ? 340 : 440, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.04);

        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(oscGain);
        oscGain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.045);

        // Layer 3: Solid chassis thud
        var subOsc = audioCtx.createOscillator();
        var subGain = audioCtx.createGain();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(isRelease ? 95 : 125, now + 0.004);
        subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.06);

        subGain.gain.setValueAtTime(0.25, now + 0.004);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        subOsc.connect(subGain);
        subGain.connect(audioCtx.destination);
        subOsc.start(now + 0.004);
        subOsc.stop(now + 0.065);
      } catch (err) {
        // AudioContext autoplay policy or audio disabled
      }
    }

    // Scene
    var scene = new THREE.Scene();

    // Camera (tuned for bold heroic presence filling the left column)
    var camera = new THREE.PerspectiveCamera(24, width / height, 0.1, 100);
    camera.position.set(0.10, 0.07, 0.78);
    camera.lookAt(0, 0.005, 0);

    // Renderer
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Lighting rig
    var amb = new THREE.AmbientLight(0xffffff, 1.05);
    scene.add(amb);
    var key = new THREE.DirectionalLight(0xffffff, 2.3);
    key.position.set(2, 4, 3);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xa0c0ff, 1.1);
    fill.position.set(-2, 1, 2);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0xffffff, 1.3);
    rim.position.set(0, 2, -2);
    scene.add(rim);

    // Root group for multi-axis rotation and tilt
    var walkmanGroup = new THREE.Group();
    scene.add(walkmanGroup);

    // Base rotation: classic 3/4 isometric perspective
    var defaultRotX = 0.20;
    var defaultRotY = -0.45;
    var defaultRotZ = -0.04;
    walkmanGroup.rotation.set(defaultRotX, defaultRotY, defaultRotZ);

    var buttonCap = null;
    var buttonCapMat = null;
    var buttonHitbox = null;
    var isHotlineEngaged = false;
    var rootModel = null;
    var tapeMesh = null;

    // Load Walkman model with automatic fallback
    var loader = new THREE.GLTFLoader();
    function onModelSuccess(gltf) {
      rootModel = gltf.scene;

      // Hide headphones (Circle.003) so the Walkman body & cassette player stand out cleanly
      rootModel.traverse(function (child) {
        if (child.isMesh) {
          if (child.name.indexOf("Circle.003") !== -1) {
            child.visible = false;
          }
          if (child.name.indexOf("Cube.005") !== -1) {
            tapeMesh = child;
          }
        }
      });

      // Center geometry around (0, 0, 0)
      var box = new THREE.Box3().setFromObject(rootModel);
      var center = box.getCenter(new THREE.Vector3());
      rootModel.position.set(-center.x, -center.y, -center.z);
      walkmanGroup.add(rootModel);

      // Yellow HOT LINE Button 3D Cap (positioned right on top face)
      var btnCapGeom = new THREE.BoxGeometry(0.015, 0.007, 0.017);
      buttonCapMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff6600,
        emissiveIntensity: 0.7,
        roughness: 0.35,
        metalness: 0.1
      });
      buttonCap = new THREE.Mesh(btnCapGeom, buttonCapMat);
      buttonCap.position.set(-0.0175, 0.104, 0.0364);
      rootModel.add(buttonCap);

      // Invisible generous spherical hitbox for easy clicking & hovering
      var hitboxGeom = new THREE.SphereGeometry(0.022, 12, 12);
      var hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
      buttonHitbox = new THREE.Mesh(hitboxGeom, hitboxMat);
      buttonHitbox.position.set(-0.0175, 0.104, 0.0364);
      rootModel.add(buttonHitbox);
    }

    loader.load("assets/model/walkman_music_player.glb", onModelSuccess, undefined, function () {
      loader.load("walkman_music_player.glb", onModelSuccess, undefined, function (err) {
        console.warn("Walkman GLB loading failed:", err);
      });
    });

    // Button press logic
    function pressYellowButton() {
      isHotlineEngaged = !isHotlineEngaged;

      // Sound effect
      playCassetteSwitch(!isHotlineEngaged);

      // Button physical 3D animation
      if (buttonCap && window.gsap) {
        window.gsap.killTweensOf(buttonCap.position);
        window.gsap.timeline()
          .to(buttonCap.position, { y: 0.098, duration: 0.07, ease: "power2.in" })
          .to(buttonCap.position, {
            y: isHotlineEngaged ? 0.101 : 0.104,
            duration: 0.12,
            ease: "back.out(2)"
          });

        if (buttonCapMat) {
          window.gsap.to(buttonCapMat.color, {
            r: 1.0,
            g: isHotlineEngaged ? 0.25 : 0.67,
            b: isHotlineEngaged ? 0.25 : 0.0,
            duration: 0.2
          });
          window.gsap.to(buttonCapMat, {
            emissiveIntensity: isHotlineEngaged ? 1.3 : 0.7,
            duration: 0.2
          });
        }
      }
    }

    // Raycasting & Interaction
    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();
    var isHoveringButton = false;
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dragDist = 0;
    var targetRotX = defaultRotX;
    var targetRotY = defaultRotY;
    var currentRotX = defaultRotX;
    var currentRotY = defaultRotY;
    var releaseEaseTimer = 0;

    function getNormalizedCoords(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      var clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: -((clientY - rect.top) / rect.height) * 2 + 1,
        rawX: clientX,
        rawY: clientY
      };
    }

    function checkButtonIntersection(coords) {
      if (!buttonHitbox || !buttonCap) return false;
      pointer.x = coords.x;
      pointer.y = coords.y;
      raycaster.setFromCamera(pointer, camera);
      var hits = raycaster.intersectObjects([buttonHitbox, buttonCap], true);
      return hits.length > 0;
    }

    // Pointer events on stage
    stage.addEventListener("pointerdown", function (e) {
      isDragging = true;
      var c = getNormalizedCoords(e);
      dragStartX = c.rawX;
      dragStartY = c.rawY;
      dragDist = 0;
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener("pointermove", function (e) {
      var c = getNormalizedCoords(e);

      if (isDragging) {
        var dx = c.rawX - dragStartX;
        var dy = c.rawY - dragStartY;
        dragDist += Math.abs(dx) + Math.abs(dy);
        dragStartX = c.rawX;
        dragStartY = c.rawY;

        targetRotY += dx * 0.012;
        targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.010, -0.6, 0.8);
      } else {
        // Hover raycasting
        var hit = checkButtonIntersection(c);
        if (hit !== isHoveringButton) {
          isHoveringButton = hit;
          stage.style.cursor = hit ? "pointer" : "grab";
          if (buttonCapMat) {
            buttonCapMat.emissiveIntensity = hit ? 1.1 : (isHotlineEngaged ? 1.3 : 0.7);
          }
        }
      }
    });

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      try { stage.releasePointerCapture(e.pointerId); } catch (err) {}

      // If clicked (little to no drag), trigger button press
      if (dragDist < 6) {
        var c = getNormalizedCoords(e);
        if (checkButtonIntersection(c)) {
          pressYellowButton();
        }
      }

      // Smoothly release back towards beauty angle
      releaseEaseTimer = performance.now();
    }

    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);

    // Render loop with IntersectionObserver optimization
    var isVisible = false;
    var clock = new THREE.Clock();

    function animate() {
      if (!isVisible) return;
      requestAnimationFrame(animate);

      var delta = clock.getDelta();
      var time = clock.getElapsedTime();

      // Smooth rotation interpolation
      if (!isDragging) {
        // If released, gently return toward default angle after delay
        var timeSinceRelease = performance.now() - releaseEaseTimer;
        if (timeSinceRelease > 2200) {
          targetRotX = THREE.MathUtils.lerp(targetRotX, defaultRotX, 0.02);
          targetRotY = THREE.MathUtils.lerp(targetRotY, defaultRotY, 0.02);
        }

        // Idle floating breathing motion
        walkmanGroup.position.y = Math.sin(time * 1.5) * 0.006;
      }

      currentRotX = THREE.MathUtils.lerp(currentRotX, targetRotX, 0.08);
      currentRotY = THREE.MathUtils.lerp(currentRotY, targetRotY, 0.08);

      walkmanGroup.rotation.x = currentRotX;
      walkmanGroup.rotation.y = currentRotY;

      // When HOT LINE is engaged, tape cassette spools pulse subtly
      if (isHotlineEngaged && tapeMesh) {
        tapeMesh.position.y = Math.sin(time * 8.0) * 0.0003;
      }

      renderer.render(scene, camera);
    }

    // IntersectionObserver to save GPU/battery when off-screen
    if ("IntersectionObserver" in window && aboutSection) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var wasVisible = isVisible;
          isVisible = entry.isIntersecting;
          if (isVisible && !wasVisible) {
            clock.start();
            animate();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(aboutSection);
    } else {
      isVisible = true;
      animate();
    }

    // Resize handler
    function onResize() {
      if (!stage || !renderer || !camera) return;
      var w = stage.clientWidth || 400;
      var h = stage.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }
    // Expose for inspection and integration
    window.__aboutWalkman = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      walkmanGroup: walkmanGroup,
      pressYellowButton: pressYellowButton,
      isHotlineEngaged: function () { return isHotlineEngaged; }
    };

    window.addEventListener("resize", onResize, { passive: true });
  }

  // Initialize About Walkman 3D Model
  initAboutWalkman();

  /* ------------------------------------------------------------
     13. MASTER RAF ANIMATION TICK
     ------------------------------------------------------------ */
  (function tick() {
    scrollVel *= 0.92;

    /* Marquees ticker */
    marquees.forEach(function (m) {
      m.x -= (m.base * speedMultiplier + scrollVel * 0.06);
      if (m.x <= -m.half) m.x += m.half;
      if (m.x > 0) m.x -= m.half;
      m.track.style.transform = "translate3d(" + m.x.toFixed(2) + "px,0,0)";
    });

    /* Showcase ticker */
    showcases.forEach(function (s) {
      // Hold-to-skim: when held down, speed accelerates to 15x smoothly!
      var targetSpeed = s.isHolding ? 15.0 : 0.95;
      var lerpFactor = s.isHolding ? 0.12 : 0.05;
      s.speed += (targetSpeed - s.speed) * lerpFactor;
      s.vel *= 0.92;

      s.x -= (s.speed + s.vel);

      if (s.half > 0) {
        if (s.x <= -s.half) s.x += s.half;
        if (s.x > 0) s.x -= s.half;
      }
      s.loop.style.transform = "translate3d(" + s.x.toFixed(2) + "px,0,0)";
    });

    requestAnimationFrame(tick);
  })();

  /* ------------------------------------------------------------
     14. CRT TELEVISION PRELOADER & SCREEN ZOOM TRANSITION
     ------------------------------------------------------------ */
  function initCrtLoader(onComplete) {
    var loader = document.getElementById("crtLoader");
    var tv = document.getElementById("crtTv");
    var screen = document.getElementById("crtTvScreen");
    var counter = document.getElementById("crtCounter");
    var progressBar = document.getElementById("crtProgressBar");
    var statusText = document.getElementById("crtStatus");
    var flash = document.getElementById("crtFlash");
    var bezel = document.getElementById("crtTvBezel");

    function finish() {
      if (loader) {
        loader.classList.add("is-hidden");
        loader.style.display = "none";
      }
      document.body.classList.remove("is-loading");
      if (lenis) {
        lenis.start();
        lenis.scrollTo(0, { immediate: true });
      }
      if (typeof window.ScrollTrigger !== "undefined") {
        window.ScrollTrigger.refresh();
      }
      if (typeof onComplete === "function") {
        onComplete();
      }
    }

    if (!loader || !tv || !counter) {
      finish();
      return;
    }

    // Immediately stop Lenis and reset scroll
    if (lenis) lenis.stop();
    window.scrollTo(0, 0);

    if (reducedMotion || location.search.indexOf("nofx") !== -1) {
      finish();
      return;
    }

    function startCounter() {
      var progressObj = { val: 1 };
      var lastNum = 1;

      // Animate progress bar in sync
      if (progressBar && typeof window.gsap !== "undefined") {
        window.gsap.to(progressBar, {
          width: "100%",
          duration: 1.85,
          ease: "power1.inOut"
        });
      }

      // Count 01 to 100 with retro pixel typography
      if (typeof window.gsap !== "undefined") {
        window.gsap.to(progressObj, {
          val: 100,
          duration: 1.85,
          ease: "power1.inOut",
          onUpdate: function () {
            var n = Math.floor(progressObj.val);
            if (n !== lastNum) {
              lastNum = n;
              counter.textContent = n < 10 ? "0" + n : "" + n;
            }
          },
          onComplete: function () {
            counter.textContent = "100";
            if (statusText) statusText.textContent = "READY";

            // Quick CRT phosphor power flash
            if (flash) {
              window.gsap.timeline()
                .to(flash, { opacity: 0.95, duration: 0.08, ease: "power2.out" })
                .to(flash, { opacity: 0, duration: 0.12, ease: "power2.in", onComplete: runScreenZoom });
            } else {
              runScreenZoom();
            }
          }
        });
      } else {
        finish();
      }
    }

    function runScreenZoom() {
      var tvRect = tv.getBoundingClientRect();
      var tvW = tvRect.width || 500;
      var tvH = tvRect.height || 500;

      // Cutout dimensions measured from assets/crt-tv.png
      var screenW = tvW * 0.614;
      var screenH = tvH * 0.445;

      var scaleX = window.innerWidth / screenW;
      var scaleY = window.innerHeight / screenH;
      // Generous margin ensures bezel is pushed completely past viewport borders
      var targetScale = Math.max(scaleX, scaleY) * 1.18;

      // Exact dynamic centering: align screen cutout center with viewport center
      var screenCenterX = tvRect.left + tvW * 0.50;
      var screenCenterY = tvRect.top + tvH * 0.425;
      var deltaX = (window.innerWidth / 2) - screenCenterX;
      var deltaY = (window.innerHeight / 2) - screenCenterY;

      var hudElements = [
        document.querySelector(".crt-tv__hud"),
        document.querySelector(".crt-tv__bottom-bar")
      ].filter(Boolean);
      var shadow = document.getElementById("crtTvShadow");
      var meta = document.getElementById("crtLoaderMeta");

      var zoomTl = window.gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: finish
      });

      // 1. Camera dives straight into CRT screen with centered origin
      zoomTl.to(tv, {
        scale: targetScale,
        x: deltaX,
        y: deltaY,
        duration: 1.25,
        transformOrigin: "50% 42.5%"
      }, 0);

      // 2. Fade ground shadow and metadata immediately as TV ascends/zooms
      if (shadow) {
        zoomTl.to(shadow, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out"
        }, 0);
      }
      if (meta) {
        zoomTl.to(meta, {
          opacity: 0,
          y: 8,
          duration: 0.22,
          ease: "power2.out"
        }, 0);
      }

      // 3. Fade HUD / pixel numbers early in zoom
      if (hudElements.length) {
        zoomTl.to(hudElements, {
          opacity: 0,
          duration: 0.22,
          ease: "power2.out"
        }, 0.08);
      }

      // 4. Smoothly cross-fade from CRT screen directly into the live portfolio
      zoomTl.to(loader, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.inOut"
      }, 0.76);
    }

    // Ensure bezel image is ready before initiating sequence
    if (bezel && !bezel.complete) {
      bezel.addEventListener("load", startCounter, { once: true });
      setTimeout(startCounter, 350);
    } else {
      requestAnimationFrame(function () {
        setTimeout(startCounter, 60);
      });
    }
  }

  /* ------------------------------------------------------------
     15. PXPUSH STICKY STACKING METHODOLOGY CARDS
     ------------------------------------------------------------ */
  function initStickyStackingCards() {
    var section = document.querySelector(".section.section__blue");
    var container = document.querySelector(".benefits__items");
    var target = document.querySelector(".benefits");
    if (!section || !container || !target) return;

    var items = container.querySelectorAll(".benefits__items--item");
    if (!items.length) return;

    var isMobile = function () {
      return window.innerWidth <= 600;
    };

    var cachedSectionTop = 0;
    function measure() {
      var scroll = (lenis && typeof lenis.scroll === "number") ? lenis.scroll : (window.pageYOffset || 0);
      cachedSectionTop = section.getBoundingClientRect().top + scroll;
    }
    measure();

    function update(scrollY) {
      if (isMobile()) {
        items.forEach(function (el) {
          window.gsap.set(el, { y: 0 });
        });
        return;
      }

      var targetRect = target.getBoundingClientRect();
      var winH = window.innerHeight || document.documentElement.clientHeight;
      var inView = targetRect.top <= 0 && targetRect.bottom >= winH;

      var a = Math.max(winH * 0.095, 80);
      var lastItem = items[items.length - 1];
      var k = (lastItem ? lastItem.clientHeight : 440) + a * (items.length - 1);
      var g = Math.max(-1, Math.min(1 - (1 - winH / k), 1));

      var currentScroll = typeof scrollY === "number" ? scrollY : ((lenis && typeof lenis.scroll === "number") ? lenis.scroll : (window.pageYOffset || 0));
      var sectionTop = cachedSectionTop || section.offsetTop;

      if (!inView) {
        if (targetRect.top > 0) {
          // Above section: unpin all
          items.forEach(function (el) {
            window.gsap.set(el, { y: 0 });
          });
          return;
        } else if (targetRect.bottom < winH) {
          // Below section: lock in final stacked positions
          var endScroll = sectionTop + target.offsetHeight - winH;
          items.forEach(function (v, w) {
            var H = a * (w + 1) * g;
            var p = endScroll - sectionTop - v.offsetTop + H;
            if (p >= 0) {
              window.gsap.set(v, { y: p * g });
            }
          });
          return;
        }
      }

      items.forEach(function (v, w) {
        var H = a * (w + 1) * g;
        var p = currentScroll - sectionTop - v.offsetTop + H;
        if (p >= 0) {
          window.gsap.set(v, { y: p * g });
        } else {
          window.gsap.set(v, { y: 0 });
        }
      });
    }

    if (lenis) {
      lenis.on("scroll", function (e) {
        update(e.animatedScroll);
      });
    } else {
      window.addEventListener("scroll", function () {
        update();
      }, { passive: true });
    }

    window.addEventListener("resize", function () {
      measure();
      update();
    });

    if (typeof window.ScrollTrigger !== "undefined") {
      window.ScrollTrigger.addEventListener("refresh", function () {
        measure();
        update();
      });
    }

    setTimeout(function () {
      measure();
      update();
    }, 250);
  }

  // Initialize CRT Loader with hero entrance callback
  initCrtLoader(triggerHeroEntrance);

  // Initialize Sticky Stacking Methodology Cards
  initStickyStackingCards();
})();
