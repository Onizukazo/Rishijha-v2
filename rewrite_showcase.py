import sys

def replace_blocks():
    with open('js/main.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find block 1
    start_1 = -1
    end_1 = -1
    for i, line in enumerate(lines):
        if '5. SHOWCASE: HOLD-TO-SKIM & VELOCITY LOOP' in line:
            start_1 = i - 1
        if '6. SERVICES ACCORDION' in line:
            end_1 = i - 1
            break

    if start_1 != -1 and end_1 != -1:
        replacement_1 = """    /* ------------------------------------------------------------
       5. SHOWCASE: HORIZONTAL SCROLL
       ------------------------------------------------------------ */
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      var showcaseSection = document.querySelector(".section--works");
      var showcaseLoop = document.querySelector(".showcase__loop");
      var showcaseCont = document.querySelector(".showcase");

      if (showcaseSection && showcaseLoop && showcaseCont) {
        function getScrollAmount() {
          var loopWidth = showcaseLoop.scrollWidth;
          var containerWidth = showcaseCont.clientWidth;
          return -(loopWidth - containerWidth + (window.innerWidth * 0.05));
        }

        var showcaseTween = gsap.to(showcaseLoop, {
          x: getScrollAmount,
          ease: "none"
        });

        ScrollTrigger.create({
          trigger: showcaseSection,
          start: "top top",
          end: () => "+=" + (showcaseLoop.scrollWidth), 
          pin: true,
          animation: showcaseTween,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        });
      }
    }

"""
        lines = lines[:start_1] + [replacement_1] + lines[end_1:]
    
    # Find block 2 (ticker)
    start_2 = -1
    end_2 = -1
    for i, line in enumerate(lines):
        if '/* Showcase ticker (only update if visible in viewport) */' in line:
            start_2 = i
        if start_2 != -1 and '      }' in line and i > start_2 + 10:
            if 's.loop.style.transform' in lines[i-2]:
                end_2 = i + 1
                break
                
    if start_2 != -1 and end_2 != -1:
        lines = lines[:start_2] + lines[end_2:]

    with open('js/main.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Done")

if __name__ == '__main__':
    replace_blocks()
