import re

# ========== 1. UPDATE index.html ==========
html = open('index.html', 'r', encoding='utf-8').read()

# Replace the footer section
old_footer = r'<!-- ================= FOOTER ================= -->.*?</section>\s*</main>'
new_footer = '''<!-- ================= FOOTER ================= -->
      <section class="section section--footer" id="footer">
        <!-- Video background layer -->
        <video class="footer-video-bg" id="footerVideoBg" src="assets/nothin_video.mp4" autoplay loop muted playsinline crossorigin="anonymous"></video>
        
        <!-- White overlay with text cutout (mix-blend-mode: screen) -->
        <div class="footer-hero-overlay">
          <div class="footer-hero-content">
            <div class="footer-hero-text-wrap">
              <h1 class="footer-hero-name">RISHI JHA</h1>
            </div>
          </div>
        </div>

        <!-- Contact info on top of everything -->
        <div class="footer-contact-layer">
          <div class="footer-top">
            <div class="footer-top-left">
              <span class="footer-badge monospace">N&deg;004</span>
              <h2 class="footer-headline">LET&#39;S MAKE<br>SOMETHING GOOD.</h2>
              <div class="footer-ctas">
                <a href="https://cal.com/rishijha" target="_blank" rel="noopener" class="cta-btn">GET IN TOUCH <span class="arrow">&rarr;</span></a>
                <a href="mailto:tarunjha.rishi@gmail.com" class="cta-btn">EMAIL ME <span class="arrow">@</span></a>
              </div>
            </div>
            <div class="footer-top-right">
              <div class="footer-socials monospace">
                <a href="https://www.linkedin.com/in/rishi5462/" target="_blank" rel="noopener">LinkedIn &nearr;</a>
                <a href="https://www.instagram.com/rishisensei/" target="_blank" rel="noopener">Instagram &nearr;</a>
                <a href="https://www.behance.net/rishijha5462" target="_blank" rel="noopener">Behance &nearr;</a>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div class="footer-bottom-left monospace">
              <span>&copy;2026 &mdash; RISHI JHA</span>
              <span class="dot-separator">&bull;</span>
              <span>BASED IN INDIA</span>
              <span class="dot-separator">&bull;</span>
              <span>GMT +05:30</span>
              <span class="dot-separator">&bull;</span>
              <span>PORTFOLIO V.02</span>
            </div>
            <div class="footer-bottom-right monospace">
              <a href="https://drive.google.com/file/d/1_3mG3uvyGgM9FJiwiCuYvdRgmfoehdO8/view?usp=sharing" target="_blank" rel="noopener">Resume &nearr;</a>
            </div>
          </div>
        </div>
      </section>

    </main>'''

html = re.sub(old_footer, new_footer, html, flags=re.DOTALL)
open('index.html', 'w', encoding='utf-8').write(html)
print("index.html updated")

# ========== 2. UPDATE css/style.css ==========
css = open('css/style.css', 'r', encoding='utf-8').read()

# Remove old fax and footer CSS sections
css = re.sub(r'/\* =========================================\s*FAX PRINTER OVERLAY.*$', '', css, flags=re.DOTALL)
css = re.sub(r'/\* =========================================\s*FAX FOOTER.*$', '', css, flags=re.DOTALL)
css = re.sub(r'/\* =========================================\s*FOOTER NOTH\.IN STYLE.*$', '', css, flags=re.DOTALL)

# Append the new footer CSS
new_css = '''

/* =========================================
   FOOTER - NOTH.IN HERO STYLE
   ========================================= */

.section--footer {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

/* 1. Video background - fills entire footer */
.footer-video-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* 2. White overlay with mix-blend-mode: screen
   This makes the white areas opaque and black areas transparent,
   so the video shows THROUGH the text */
.footer-hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  mix-blend-mode: screen;
  pointer-events: none;
}

.footer-hero-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-hero-text-wrap {
  width: 100%;
  text-align: center;
  padding: 0 2vw;
}

.footer-hero-name {
  font-family: 'Termina', 'SemiSqueezedMedium', sans-serif;
  font-size: clamp(4rem, 15vw, 20rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.02em;
  color: #000;
  margin: 0;
  text-transform: uppercase;
  white-space: nowrap;
}

/* 3. Contact info layer on top of everything */
.footer-contact-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(1.5rem, 4vh, 3rem) clamp(1.5rem, 3vw, 3rem);
  pointer-events: none;
}

.footer-contact-layer * {
  pointer-events: auto;
}

.footer-contact-layer .footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.footer-contact-layer .footer-top-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-contact-layer .footer-badge {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.1em;
}

.footer-contact-layer .footer-headline {
  font-family: 'Termina', 'SemiSqueezedMedium', sans-serif;
  font-size: clamp(1.5rem, 3.5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  color: #fff;
  margin: 0;
  text-transform: uppercase;
}

.footer-contact-layer .footer-ctas {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.footer-contact-layer .cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 100px;
  color: #fff;
  font-family: 'PPNeueMontrealMono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-decoration: none;
  text-transform: uppercase;
  transition: background 0.3s, border-color 0.3s;
}

.footer-contact-layer .cta-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.6);
}

.footer-contact-layer .footer-top-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.footer-contact-layer .footer-socials {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}

.footer-contact-layer .footer-socials a {
  color: #fff;
  font-size: 0.85rem;
  text-decoration: none;
  transition: opacity 0.3s;
}

.footer-contact-layer .footer-socials a:hover {
  opacity: 0.6;
}

.footer-contact-layer .footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-contact-layer .footer-bottom-left {
  display: flex;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.footer-contact-layer .footer-bottom-right a {
  color: #fff;
  font-size: 0.75rem;
  text-decoration: none;
  letter-spacing: 0.05em;
  transition: opacity 0.3s;
}

.footer-contact-layer .footer-bottom-right a:hover {
  opacity: 0.6;
}

.footer-contact-layer .dot-separator {
  color: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .footer-hero-name {
    font-size: clamp(3rem, 18vw, 8rem);
    white-space: normal;
    word-break: break-word;
  }

  .footer-contact-layer .footer-top {
    flex-direction: column;
    gap: 2rem;
  }

  .footer-contact-layer .footer-top-right {
    align-items: flex-start;
  }

  .footer-contact-layer .footer-socials {
    text-align: left;
    flex-direction: row;
    gap: 1rem;
  }

  .footer-contact-layer .footer-ctas {
    flex-direction: column;
  }

  .footer-contact-layer .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .footer-contact-layer .footer-bottom-left {
    flex-wrap: wrap;
  }
}
'''

css += new_css
open('css/style.css', 'w', encoding='utf-8').write(css)
print("style.css updated")

# ========== 3. UPDATE js/main.js ==========
js = open('js/main.js', 'r', encoding='utf-8').read()

# Remove old footer reveal JS (simple mousemove handler)
js = re.sub(
    r'  // Initialize Nothin style Footer Reveal\n.*?  \}\);\n',
    '',
    js,
    flags=re.DOTALL
)

open('js/main.js', 'w', encoding='utf-8').write(js)
print("main.js updated")

print("\nDone! All files updated.")
