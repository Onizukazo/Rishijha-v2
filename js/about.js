/* ============================================================
   ABOUT PAGE JAVASCRIPT (AUTHENTIC PXPUSH SYSTEM)
   ============================================================ */

(function () {
  'use strict';

  // 1. ================= SMOOTH SCROLL (LENIS) =================
  var lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.8
    });

    lenis.on('scroll', function () {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lenis = lenis;
  }

  // 2. ================= HEADER & MOBILE NAV =================
  var menuBtn = document.querySelector('header .menu');
  var mobileNav = document.getElementById('mobile-navigation');
  var backdrop = document.querySelector('.mobilenav__backdrop');

  if (menuBtn && mobileNav) {
    function toggleMenu() {
      var isOpen = document.body.classList.toggle('menu_open');
      menuBtn.setAttribute('aria-expanded', isOpen);
      menuBtn.textContent = isOpen ? 'Close' : 'Menu';
    }

    menuBtn.addEventListener('click', toggleMenu);
    if (backdrop) backdrop.addEventListener('click', toggleMenu);

    var mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (document.body.classList.contains('menu_open')) toggleMenu();
      });
    });
  }

  // 3. ================= MARQUEE TICKERS =================
  var marquees = document.querySelectorAll('[data-marquee]');
  marquees.forEach(function (marquee) {
    var track = marquee.querySelector('.marqueeText__track');
    if (!track) return;
    
    // Duplicate track content to guarantee seamless infinite scroll
    track.innerHTML += track.innerHTML;

    var speed = parseFloat(marquee.getAttribute('data-base-speed') || 1.2);
    var x = 0;
    var halfWidth = track.scrollWidth / 2;

    function step() {
      x -= speed;
      if (Math.abs(x) >= halfWidth) {
        x = 0;
      }
      track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  // 4. ================= 3D DIGICAM HERO =================
  var cameraCanvas = document.getElementById('cameraCanvas');
  var cameraStage = document.getElementById('cameraStage');

  if (cameraCanvas && cameraStage && typeof THREE !== 'undefined') {
    var photos = [
      'assets/rishi/photo1.jpg',
      'assets/rishi/photo2.jpg',
      'assets/rishi/photo3.jpg',
      'assets/rishi/photo4.jpg',
      'assets/rishi/photo5.jpg'
    ];
    var currentPhotoIdx = 0;
    var loadedImages = [];

    // Preload photos
    photos.forEach(function (src, idx) {
      var img = new Image();
      img.src = src;
      img.onload = function () {
        loadedImages[idx] = img;
        if (idx === currentPhotoIdx) updateScreenCanvas();
      };
    });

    // 2D Canvas for LCD screen texture
    var screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 700;
    var ctx = screenCanvas.getContext('2d');
    var screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.generateMipmaps = true;
    screenTexture.minFilter = THREE.LinearMipmapLinearFilter;

    function updateScreenCanvas() {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

      var img = loadedImages[currentPhotoIdx];
      if (img && img.complete) {
        var imgRatio = img.width / img.height;
        var canvasRatio = screenCanvas.width / screenCanvas.height;
        var sWidth, sHeight, sx, sy;

        if (imgRatio > canvasRatio) {
          sHeight = img.height;
          sWidth = img.height * canvasRatio;
          sx = (img.width - sWidth) / 2;
          sy = 0;
        } else {
          sWidth = img.width;
          sHeight = img.width / canvasRatio;
          sx = 0;
          sy = (img.height - sHeight) / 2;
        }
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, screenCanvas.width, screenCanvas.height);
      }

      // Vintage OSD (On-Screen Display) Overlay
      // Vignette
      var grad = ctx.createRadialGradient(512, 350, 200, 512, 350, 550);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

      // Subtle Scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (var y = 0; y < screenCanvas.height; y += 4) {
        ctx.fillRect(0, y, screenCanvas.width, 1);
      }

      // Digicam HUD text
      ctx.fillStyle = '#00ff66';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('[' + String(currentPhotoIdx + 1).padStart(2, '0') + '/05]', 40, 52);
      ctx.fillText('FINE 12M', 180, 52);

      // Battery icon
      ctx.fillStyle = '#00ff66';
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenCanvas.width - 100, 32, 45, 24);
      ctx.fillRect(screenCanvas.width - 53, 39, 4, 10);
      ctx.fillRect(screenCanvas.width - 96, 36, 11, 16);
      ctx.fillRect(screenCanvas.width - 82, 36, 11, 16);
      ctx.fillRect(screenCanvas.width - 68, 36, 11, 16);

      // Green Focus Brackets in Center
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 3;
      var cx = 512, cy = 350, bw = 60, bh = 50;
      ctx.beginPath();
      ctx.moveTo(cx - bw, cy - bh + 20); ctx.lineTo(cx - bw, cy - bh); ctx.lineTo(cx - bw + 20, cy - bh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + bw - 20, cy - bh); ctx.lineTo(cx + bw, cy - bh); ctx.lineTo(cx + bw, cy - bh + 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - bw, cy + bh - 20); ctx.lineTo(cx - bw, cy + bh); ctx.lineTo(cx - bw + 20, cy + bh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + bw - 20, cy + bh); ctx.lineTo(cx + bw, cy + bh); ctx.lineTo(cx + bw, cy + bh - 20);
      ctx.stroke();

      // Bottom info
      ctx.fillStyle = '#ffffff';
      ctx.font = '22px monospace';
      ctx.fillText('OCT 16 2026', 40, screenCanvas.height - 40);
      ctx.fillText('ISO 100', 210, screenCanvas.height - 40);
      ctx.fillText('SD 32GB', screenCanvas.width - 160, screenCanvas.height - 40);

      screenTexture.needsUpdate = true;
    }

    updateScreenCanvas();

    // Web Audio Shutter Sound
    var audioCtx = null;
    function playShutterSound() {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (e) {}
    }

    // Three.js Scene
    var scene = new THREE.Scene();
    var camera3d = new THREE.PerspectiveCamera(38, cameraStage.clientWidth / cameraStage.clientHeight, 0.01, 10);
    camera3d.position.set(0, 0, 0.38);

    var renderer = new THREE.WebGLRenderer({ canvas: cameraCanvas, antialias: true, alpha: true });
    renderer.setSize(cameraStage.clientWidth, cameraStage.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // Lighting
    var amb = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(amb);
    var keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);
    var fillLight = new THREE.DirectionalLight(0x9fe4f3, 1.6);
    fillLight.position.set(-3, -2, -3);
    scene.add(fillLight);
    var backRim = new THREE.DirectionalLight(0xffffff, 2.0);
    backRim.position.set(0, 3, -4);
    scene.add(backRim);

    var cameraGroup = new THREE.Group();
    // 30% larger camera
    cameraGroup.scale.setScalar(1.30);
    // Face directly towards user so back screen and buttons are front and center
    cameraGroup.rotation.y = Math.PI;
    cameraGroup.rotation.x = 0;
    scene.add(cameraGroup);

    // Screen Mesh
    var screenGeom = new THREE.PlaneGeometry(0.078, 0.0535);
    var screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
    var screenMesh = new THREE.Mesh(screenGeom, screenMat);
    screenMesh.position.set(0.0215, 0.0035, -0.0327);
    screenMesh.rotation.y = Math.PI; // Face backwards (-z)
    cameraGroup.add(screenMesh);

    // Camera Physical Button Hitboxes
    // 1. Forward button (Right side of wheel: [+/-] icon at x = -0.0625, y = -0.007, z = -0.033)
    var fwdHitboxGeom = new THREE.SphereGeometry(0.0085, 12, 12);
    var fwdHitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    var btnForward = new THREE.Mesh(fwdHitboxGeom, fwdHitboxMat);
    btnForward.position.set(-0.0625, -0.007, -0.033);
    btnForward.name = 'btnForward';
    cameraGroup.add(btnForward);

    // 2. Backward button (Left side of wheel: timer icon at x = -0.0455, y = -0.007, z = -0.033)
    var bwdHitboxGeom = new THREE.SphereGeometry(0.0085, 12, 12);
    var bwdHitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    var btnBackward = new THREE.Mesh(bwdHitboxGeom, bwdHitboxMat);
    btnBackward.position.set(-0.0455, -0.007, -0.033);
    btnBackward.name = 'btnBackward';
    cameraGroup.add(btnBackward);

    // Load Model
    if (typeof THREE.GLTFLoader !== 'undefined') {
      var loader = new THREE.GLTFLoader();
      loader.load('assets/camera/ASSET.gltf', function (gltf) {
        var model = gltf.scene;
        var box = new THREE.Box3().setFromObject(model);
        var center = box.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -center.y, -center.z);
        cameraGroup.add(model);
        window.__cameraReady = true;
      });
    }

    // Photo switching logic (triggered ONLY by forward/backward buttons on camera)
    function setPhoto(idx) {
      currentPhotoIdx = (idx + photos.length) % photos.length;
      playShutterSound();
      updateScreenCanvas();
    }

    // Raycaster for camera button interaction
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var interactiveButtons = [btnForward, btnBackward];

    var isDragging = false;
    var startX = 0, startY = 0;
    var prevMouseX = 0, prevMouseY = 0;
    var targetRotY = Math.PI;
    var targetRotX = 0;

    // Mouse Interaction
    cameraCanvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', function (e) {
      if (!isDragging) return;
      isDragging = false;

      // Click check: if moved less than 6px, check raycast on camera buttons
      var dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (dist < 6) {
        var rect = cameraCanvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera3d);

        var intersects = raycaster.intersectObjects(interactiveButtons, true);
        if (intersects.length > 0) {
          var hitName = intersects[0].object.name;
          if (hitName === 'btnForward') {
            setPhoto(currentPhotoIdx + 1);
          } else if (hitName === 'btnBackward') {
            setPhoto(currentPhotoIdx - 1);
          }
        }
      }
    });

    window.addEventListener('mousemove', function (e) {
      if (isDragging) {
        var dx = e.clientX - prevMouseX;
        var dy = e.clientY - prevMouseY;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
        targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Hover raycast for cursor feedback on camera buttons
        var rect = cameraCanvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera3d);
        var hits = raycaster.intersectObjects(interactiveButtons, true);
        cameraCanvas.style.cursor = hits.length > 0 ? 'pointer' : 'grab';

        // Subtle parallax
        var nx = (e.clientX / window.innerWidth) - 0.5;
        var ny = (e.clientY / window.innerHeight) - 0.5;
        camera3d.position.x = nx * 0.02;
        camera3d.position.y = -ny * 0.02;
        camera3d.lookAt(0, 0, 0);
      }
    });

    // Touch support
    var touchStartX = 0, touchStartY = 0;
    cameraCanvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      if (!isDragging) return;
      isDragging = false;

      if (e.changedTouches.length > 0) {
        var touch = e.changedTouches[0];
        var dist = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);
        if (dist < 10) {
          var rect = cameraCanvas.getBoundingClientRect();
          mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera3d);

          var intersects = raycaster.intersectObjects(interactiveButtons, true);
          if (intersects.length > 0) {
            var hitName = intersects[0].object.name;
            if (hitName === 'btnForward') {
              setPhoto(currentPhotoIdx + 1);
            } else if (hitName === 'btnBackward') {
              setPhoto(currentPhotoIdx - 1);
            }
          }
        }
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (isDragging && e.touches.length === 1) {
        var dx = e.touches[0].clientX - prevMouseX;
        var dy = e.touches[0].clientY - prevMouseY;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
        targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    // Animation Loop
    var time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.02;

      cameraGroup.rotation.y += (targetRotY - cameraGroup.rotation.y) * 0.08;
      cameraGroup.rotation.x += (targetRotX - cameraGroup.rotation.x) * 0.08;
      cameraGroup.position.y = Math.sin(time) * 0.003;

      renderer.render(scene, camera3d);
    }
    animate();

    function updateCameraAspect() {
      if (!cameraStage) return;
      var w = cameraStage.clientWidth;
      var h = cameraStage.clientHeight;
      camera3d.aspect = w / h;
      if (w < 600) {
        camera3d.position.z = 0.38 * (600 / w);
      } else {
        camera3d.position.z = 0.38;
      }
      camera3d.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    updateCameraAspect();

    window.addEventListener('resize', updateCameraAspect);

    window.__getButtonScreenCoords = function () {
      var rect = cameraCanvas.getBoundingClientRect();
      var vFwd = new THREE.Vector3();
      btnForward.getWorldPosition(vFwd);
      vFwd.project(camera3d);
      var fwdX = rect.left + (vFwd.x * 0.5 + 0.5) * rect.width;
      var fwdY = rect.top + (-(vFwd.y * 0.5) + 0.5) * rect.height;

      var vBwd = new THREE.Vector3();
      btnBackward.getWorldPosition(vBwd);
      vBwd.project(camera3d);
      var bwdX = rect.left + (vBwd.x * 0.5 + 0.5) * rect.width;
      var bwdY = rect.top + (-(vBwd.y * 0.5) + 0.5) * rect.height;

      return {
        forward: { x: fwdX, y: fwdY },
        backward: { x: bwdX, y: bwdY },
        currentPhotoIdx: currentPhotoIdx
      };
    };
  }

  // 5. ================= ACCORDIONS (AUTHENTIC PXPUSH) =================
  var faqItems = document.querySelectorAll('.faqs__list');
  faqItems.forEach(function (item) {
    var content = item.querySelector('.accordion__content');
    
    // Hover animation origin tracking
    item.addEventListener('mouseenter', function (e) {
      var rect = item.getBoundingClientRect();
      var origin = (e.clientY - rect.top < rect.height / 2) ? '0%' : '100%';
      item.style.setProperty('--accordion-origin', origin);
      item.style.setProperty('--anim', '1');
    });

    item.addEventListener('mouseleave', function () {
      item.style.setProperty('--anim', '0');
    });

    // Click toggle
    item.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      if (isOpen) {
        item.classList.remove('is-open');
        item.setAttribute('aria-expanded', 'false');
        if (content) content.style.height = '0px';
      } else {
        item.classList.add('is-open');
        item.setAttribute('aria-expanded', 'true');
        if (content) {
          content.style.height = content.scrollHeight + 'px';
        }
      }
    });

    // Keyboard enter / space support
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  // 6. ================= FOOTER (SLICED TEXT TRAIL & LIVE IST CLOCK) =================
  var timeEl = document.getElementById('footer-time');
  if (timeEl) {
    setInterval(function () {
      var d = new Date();
      var timeString = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      timeEl.innerHTML = 'IST &rarr; ' + timeString;
    }, 1000);
  }

  var heroStack = document.getElementById('footer-hero-stack');
  var footer = document.querySelector('.section--footer');
  if (heroStack && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.set(heroStack, { '--trail-progress': 0 });

    gsap.to(heroStack, {
      '--trail-progress': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: footer || heroStack,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true
      }
    });

    heroStack.addEventListener('mouseenter', function () {
      gsap.to(heroStack, {
        '--trail-progress': 1.25,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    heroStack.addEventListener('mouseleave', function () {
      gsap.to(heroStack, {
        '--trail-progress': 1,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  }

})();
