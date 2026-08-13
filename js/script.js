/* ==========================================================================
   Seamless Web3 Banking - behaviour
   1. Proportional scaling of the fixed 1685px Figma artboard
   2. Navigation: smooth scrolling + active pill (the "selected" pill state
      exists in the Figma file as a hidden 10% white fill)
   3. Showcase dots: selected state
   ========================================================================== */
(function () {
  'use strict';

  var DESIGN_WIDTH = 1685;
  var DESIGN_HEIGHT = 1073;
  var DESKTOP_QUERY = '(min-width: 901px)';

  var stage = document.getElementById('stage');

  /* ---------------------------------------------------------------------
     1. Scaling
     On desktop the artwork is uniformly scaled by the tighter viewport axis.
     The panel then expands along the other axis, allowing its panes, card
     spacing and edge-aligned chrome to fill the viewport without stretching
     text, images or icons.
     Under the mobile breakpoint the stage reflows instead, and only the
     individual feature cards - which are pixel-locked compositions - are
     scaled to the width of the single column.
     --------------------------------------------------------------------- */
  function layout() {
    var width = document.documentElement.clientWidth;
    var isDesktop = window.matchMedia(DESKTOP_QUERY).matches;

    if (isDesktop) {
      var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      var scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
      var layoutWidth = width / scale;
      var layoutHeight = height / scale;

      stage.style.setProperty('--scale', scale);
      stage.style.setProperty('--layout-width', layoutWidth + 'px');
      stage.style.setProperty('--layout-height', layoutHeight + 'px');
    } else {
      stage.style.removeProperty('--scale');
      stage.style.removeProperty('--layout-width');
      stage.style.removeProperty('--layout-height');
      scaleFeatureCards();
    }
  }

  function scaleFeatureCards() {
    var slots = document.querySelectorAll('.lcard-slot');

    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      var card = slot.firstElementChild;
      var cardWidth = card.offsetWidth;
      if (!cardWidth) continue;

      var scale = slot.clientWidth / cardWidth;
      var crop = parseFloat(getComputedStyle(card).getPropertyValue('--crop-top')) || 0;

      slot.style.setProperty('--card-scale', scale);
      slot.style.setProperty('--crop-shift', -crop * scale + 'px');
      slot.style.height = (card.offsetHeight - crop) * scale + 'px';
    }
  }

  var resizeFrame = null;
  function onResize() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(layout);
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
  }
  window.addEventListener('load', layout);
  layout();

  /* =====================================================================
     2. Section transition (scroll triggered)

     Measured frame by frame from the reference recording at 60fps. One
     scroll gesture plays a two-phase transition; the header never moves
     except for the nav pills, which slide across to section 2's position.

       phase 1  0 - 800ms   section 1 scene leaves
                              opacity    1 -> 0            linear
                              translateY -3150 * 2^(9.1(u-1))   (fit rms 3.4px)
                              scale      1 - 0.039 * u^0.62    (fit rms 0.001)
       pills   17 - 750ms   x 96.76px -> section 2's x
                              cubic-bezier(.42, .09, 0, 1)  (fit rmse 0.002)
       phase 2  section 2 arrives, staggered as measured
                    heading  750 - 1333ms  opacity 0 -> 1  ease-out p2.2
                    cards    770 - 1670ms  opacity 0 -> 1  linear

     At the phase boundary both scenes are invisible and the two panels are
     pixel-identical (panel fill + pinned header), so the scroll is moved
     between slots there and the cut cannot be seen.
     ===================================================================== */
  var EXIT_MS = 800;            // section 1 is fully faded here
  var PILL_MS = 733;
  var PILL_DELAY = 17;          // the pills start one frame after the scene
  var TITLE_AT = 750, TITLE_MS = 583;   // section 2 heading (eased)
  var CARDS_AT = 770, CARDS_MS = 900;   // section 2 cards
  var TOTAL_MS = CARDS_AT + CARDS_MS;
  var EXIT_TRAVEL = -3150;      // px, ease-in-expo amplitude (fitted)
  var EXIT_EXP = 9.1;           // exponent of the 2^(k(u-1)) ease-in (fitted)
  var EXIT_SCALE = 0.039;       // 1 -> 0.961 (fitted)
  var EXIT_SCALE_EXP = 0.62;    // the shrink leads the translate (fitted)
  var HERO_PILL_X = 96.76;      // section 1 nav-pill left, from the frame
  var PILL_HALF = 142.5;        // half the 285px pill row, section 2 centres it

  var slots = document.querySelectorAll('.panel-slot');
  var heroScene = document.querySelector('.hero__scene');
  var featScene = document.querySelector('.lifestyle__scene');
  var heroPills = document.querySelector('.hero .navlinks');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* cubic-bezier(.42,.09,0,1) - fitted to the pill track, rmse 0.0024 */
  function pillEase(t) {
    var x1 = 0.42, x2 = 0.0, y1 = 0.09, y2 = 1.0;
    var s = t;
    for (var i = 0; i < 8; i++) {
      var bx = 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s;
      var d = 3 * (1 - s) * (1 - s) * x1 + 6 * (1 - s) * s * (x2 - x1) + 3 * s * s * (1 - x2);
      if (Math.abs(d) < 1e-6) break;
      s = Math.min(1, Math.max(0, s - (bx - t) / d));
    }
    return 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s;
  }

  function easeInExpo(t) {
    return t <= 0 ? 0 : Math.pow(2, EXIT_EXP * (t - 1));
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* how far the pills travel: section 2 centres them in the current panel */
  function pillTravel() {
    var panel = document.querySelector('.lifestyle');
    return panel ? panel.getBoundingClientRect().width /
      (parseFloat(getComputedStyle(stage).getPropertyValue('--scale')) || 1) / 2
      - PILL_HALF - HERO_PILL_X : 0;
  }

  function paint(ms) {
    var u = clamp01(ms / EXIT_MS);
    heroScene.style.setProperty('--scene-opacity', 1 - u);
    heroScene.style.setProperty('--scene-y', EXIT_TRAVEL * easeInExpo(u) + 'px');
    heroScene.style.setProperty('--scene-scale',
      1 - EXIT_SCALE * Math.pow(u, EXIT_SCALE_EXP));
    heroPills.style.setProperty('--pill-x',
      pillTravel() * pillEase(clamp01((ms - PILL_DELAY) / PILL_MS)) + 'px');
    var tu = clamp01((ms - TITLE_AT) / TITLE_MS);
    featScene.style.setProperty('--title-opacity',
      1 - Math.pow(1 - tu, 2.2));
    featScene.style.setProperty('--card-opacity',
      clamp01((ms - CARDS_AT) / CARDS_MS));
  }

  function clearPaint() {
    [heroScene, featScene].forEach(function (el) {
      el.style.removeProperty('--scene-opacity');
      el.style.removeProperty('--scene-y');
      el.style.removeProperty('--scene-scale');
      el.style.removeProperty('--title-opacity');
      el.style.removeProperty('--card-opacity');
    });
    heroPills.style.removeProperty('--pill-x');
  }

  var running = false;

  function jumpTo(index) {
    var prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    slots[index].scrollIntoView();
    document.documentElement.style.scrollBehavior = prev;
  }

  function play(forward) {
    running = true;
    document.body.classList.add('is-transitioning');
    var start = null;
    var swapped = false;

    function step(now) {
      if (start === null) start = now;
      var ms = now - start;
      if (ms > TOTAL_MS) ms = TOTAL_MS;
      var at = forward ? ms : TOTAL_MS - ms;

      /* swap slots at the boundary, where both scenes are invisible */
      if (forward ? (at >= EXIT_MS && !swapped) : (at <= EXIT_MS && !swapped)) {
        swapped = true;
        jumpTo(forward ? 1 : 0);
      }
      paint(at);

      if (ms < TOTAL_MS) {
        requestAnimationFrame(step);
      } else {
        clearPaint();
        document.body.classList.remove('is-transitioning');
        running = false;
      }
    }
    requestAnimationFrame(step);
  }

  function activeIndex() {
    var mid = window.innerHeight / 2;
    for (var i = 0; i < slots.length; i++) {
      var r = slots[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) return i;
    }
    return 0;
  }

  function transitionEnabled() {
    return slots.length === 2 && heroScene && featScene &&
      window.matchMedia(DESKTOP_QUERY).matches && !reduced.matches;
  }

  function intent(dir, event) {
    if (!transitionEnabled()) return;
    if (running) { event.preventDefault(); return; }
    var at = activeIndex();
    if (dir > 0 && at === 0) { event.preventDefault(); play(true); }
    else if (dir < 0 && at === 1) { event.preventDefault(); play(false); }
  }

  window.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) < 2) return;
    intent(e.deltaY > 0 ? 1 : -1, e);
  }, { passive: false });

  var touchY = null;
  window.addEventListener('touchstart', function (e) {
    touchY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (touchY === null) return;
    var dy = touchY - e.touches[0].clientY;
    if (Math.abs(dy) > 12) { intent(dy > 0 ? 1 : -1, e); touchY = null; }
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    if (['PageDown', 'ArrowDown', ' '].indexOf(e.key) >= 0) intent(1, e);
    else if (['PageUp', 'ArrowUp'].indexOf(e.key) >= 0) intent(-1, e);
  });

  /* jumping straight to a section via a nav link must not leave a half-played
     scene behind */
  window.addEventListener('hashchange', clearPaint);

  /* ---------------------------------------------------------------------
     3. Navigation
     The Figma pills carry a 10% white fill that is switched off, i.e. the
     highlight belongs to the hover/selected state only - no pill is filled
     in the resting frame, so selection is applied on activation only.
     --------------------------------------------------------------------- */
  var pills = Array.prototype.slice.call(document.querySelectorAll('.pill'));

  function setActive(hash) {
    pills.forEach(function (pill) {
      var isActive = pill.getAttribute('href') === hash;
      pill.classList.toggle('is-active', isActive);
      if (isActive) {
        pill.setAttribute('aria-current', 'true');
      } else {
        pill.removeAttribute('aria-current');
      }
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      setActive(pill.getAttribute('href'));
    });
  });

  /* ---------------------------------------------------------------------
     4. Showcase dots - the Figma frame defines a selected and an unselected
        dot, so selection is the only behaviour wired up here.
     --------------------------------------------------------------------- */
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      dots.forEach(function (other, otherIndex) {
        var selected = otherIndex === index;
        other.classList.toggle('is-active', selected);
        other.setAttribute('aria-pressed', String(selected));
      });
    });
  });
}());
