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
  /* The scaled artboard runs down to 1200px, where its type stops holding up
     and the tablet architecture takes over - see section 8 of the stylesheet. */
  var DESKTOP_QUERY = '(min-width: 1200px)';
  /* Between the artboard and the phone layout the feature cards are scaled as
     whole compositions; below it they are laid out at native size instead, so
     nothing needs measuring - see section 10 of the stylesheet. */
  var COMPACT_QUERY = '(min-width: 600px) and (max-width: 1199.98px)';

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
      if (window.matchMedia(COMPACT_QUERY).matches) scaleFeatureCards();
      else releaseFeatureCards();
    }
  }

  /* hand the cards back to the stylesheet: the phone layout sizes them from
     their own content, so a measured height and scale would fight it */
  function releaseFeatureCards() {
    var slots = document.querySelectorAll('.lcard-slot');

    for (var i = 0; i < slots.length; i++) {
      slots[i].style.removeProperty('--card-scale');
      slots[i].style.removeProperty('--crop-shift');
      slots[i].style.removeProperty('height');
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
                    heading       750 - 1333ms
                    security     1060 - 1900ms
                    transfers    1390 - 2350ms
                    staking      1900 - 3400ms

     At the phase boundary both scenes are invisible and the two panels are
     pixel-identical (panel fill + pinned header), so the scroll is moved
     between slots there and the cut cannot be seen.
     ===================================================================== */
  var EXIT_MS = 800;            // section 1 is fully faded here
  var PILL_MS = 733;
  var PILL_DELAY = 17;          // the pills start one frame after the scene
  var TITLE_AT = 750, TITLE_MS = 583;   // section 2 heading (eased)
  var TOTAL_MS = 3400;                  // final staking tag has settled
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
  var heroVideo = document.querySelector('.showcase__video');
  var globeVideo = document.querySelector('.globe');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function syncVideoMotion() {
    if (heroVideo) {
      if (reduced.matches) {
        heroVideo.pause();
      } else {
        var playback = heroVideo.play();
        if (playback && typeof playback.catch === 'function') {
          playback.catch(function () { /* the poster remains as a fallback */ });
        }
      }
    }

    if (globeVideo) {
      if (reduced.matches) {
        globeVideo.pause();
        featScene.classList.remove('has-transfer-loop');
      } else if (!window.matchMedia(DESKTOP_QUERY).matches) {
        /* Below the artboard breakpoint the entrance sequence that owns the
           globe never runs, so the clip would sit on its poster frame. There
           it behaves like the hero backdrop instead and simply loops. */
        startGlobe();
      }
    }
  }

  if (typeof reduced.addEventListener === 'function') {
    reduced.addEventListener('change', syncVideoMotion);
  }
  syncVideoMotion();

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

  function reveal(ms, start, duration) {
    var t = clamp01((ms - start) / duration);
    return 1 - Math.pow(1 - t, 2.2);
  }

  /* how far the pills travel: section 2 centres them in the current panel */
  function pillTravel() {
    var panel = document.querySelector('.lifestyle');
    return panel ? panel.getBoundingClientRect().width /
      (parseFloat(getComputedStyle(stage).getPropertyValue('--scale')) || 1) / 2
      - PILL_HALF - HERO_PILL_X : 0;
  }

  function paintHeroTransition(ms) {
    var u = clamp01(ms / EXIT_MS);
    heroScene.style.setProperty('--scene-opacity', 1 - u);
    heroScene.style.setProperty('--scene-y', EXIT_TRAVEL * easeInExpo(u) + 'px');
    heroScene.style.setProperty('--scene-scale',
      1 - EXIT_SCALE * Math.pow(u, EXIT_SCALE_EXP));
    heroPills.style.setProperty('--pill-x',
      pillTravel() * pillEase(clamp01((ms - PILL_DELAY) / PILL_MS)) + 'px');
  }

  function paintFeatureEntrance(ms) {
    featScene.style.setProperty('--title-opacity', reveal(ms, TITLE_AT, TITLE_MS));

    /* Independent tracks reproduce the observed left-to-right build: each
       card establishes its surface/copy before its illustration resolves. */
    featScene.style.setProperty('--security-base', reveal(ms, 1060, 420));
    featScene.style.setProperty('--security-art', reveal(ms, 1480, 420));
    featScene.style.setProperty('--transfer-base', reveal(ms, 1390, 430));
    featScene.style.setProperty('--transfer-art', reveal(ms, 1880, 470));
    featScene.style.setProperty('--staking-base', reveal(ms, 1900, 440));
    featScene.style.setProperty('--staking-rings', reveal(ms, 2220, 430));
    featScene.style.setProperty('--staking-card', reveal(ms, 2580, 430));
    featScene.style.setProperty('--staking-badge', reveal(ms, 2920, 340));
    featScene.style.setProperty('--staking-tag', reveal(ms, 3140, 260));
  }

  /* Section 2 leaves as one completed composition. Its entry tracks are not
     touched, so cards and artwork never perform an unintended reverse reveal. */
  function paintFeatureSceneExit(progress) {
    var u = clamp01(progress);
    featScene.style.setProperty('--feature-scene-opacity', 1 - u);
    featScene.style.setProperty('--feature-scene-y',
      -EXIT_TRAVEL * easeInExpo(u) + 'px');
    featScene.style.setProperty('--feature-scene-scale',
      1 - EXIT_SCALE * Math.pow(u, EXIT_SCALE_EXP));
  }

  function clearPaint() {
    [heroScene, featScene].forEach(function (el) {
      el.style.removeProperty('--scene-opacity');
      el.style.removeProperty('--scene-y');
      el.style.removeProperty('--scene-scale');
      el.style.removeProperty('--feature-scene-opacity');
      el.style.removeProperty('--feature-scene-y');
      el.style.removeProperty('--feature-scene-scale');
      el.style.removeProperty('--title-opacity');
      el.style.removeProperty('--security-base');
      el.style.removeProperty('--security-art');
      el.style.removeProperty('--transfer-base');
      el.style.removeProperty('--transfer-art');
      el.style.removeProperty('--staking-base');
      el.style.removeProperty('--staking-rings');
      el.style.removeProperty('--staking-card');
      el.style.removeProperty('--staking-badge');
      el.style.removeProperty('--staking-tag');
    });
    heroPills.style.removeProperty('--pill-x');
  }

  var running = false;

  function resetGlobe() {
    if (!globeVideo) return;
    globeVideo.pause();
    featScene.classList.remove('has-transfer-loop');
    try { globeVideo.currentTime = 0; } catch (error) { /* metadata not ready */ }
  }

  function startGlobe() {
    if (!globeVideo || reduced.matches || !globeVideo.paused) return;
    /* The class and playback are started in the same task so the node and
       video share a clock; waiting for the play promise can lag by frames. */
    featScene.classList.add('has-transfer-loop');
    var playback = globeVideo.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {
        featScene.classList.remove('has-transfer-loop');
      });
    }
  }

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
    var globeStarted = false;
    var duration = forward ? TOTAL_MS : EXIT_MS * 2;

    if (forward) resetGlobe();
    else if (globeVideo) {
      globeVideo.pause();
      featScene.classList.remove('has-transfer-loop');
    }

    function step(now) {
      if (start === null) start = now;
      var ms = now - start;
      if (ms > duration) ms = duration;

      if (forward) {
        /* The slot swap occurs once Section 1 has fully disappeared. */
        if (ms >= EXIT_MS && !swapped) {
          swapped = true;
          jumpTo(1);
        }
        paintHeroTransition(ms);
        paintFeatureEntrance(ms);

        if (ms >= 1880 && !globeStarted) {
          globeStarted = true;
          startGlobe();
        }
      } else if (ms < EXIT_MS) {
        /* Keep every Section 2 entry track complete and transition the fully
           assembled scene out as a single layer. */
        paintHeroTransition(EXIT_MS);
        paintFeatureSceneExit(ms / EXIT_MS);
      } else {
        if (!swapped) {
          swapped = true;
          jumpTo(0);
        }
        paintFeatureSceneExit(1);
        paintHeroTransition(EXIT_MS - (ms - EXIT_MS));
      }

      if (ms < duration) {
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
  window.addEventListener('hashchange', function () {
    clearPaint();
    if (window.location.hash === '#features' && !reduced.matches) {
      resetGlobe();
      startGlobe();
    }
  });

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
     4. Tablet menu
     Below the artboard breakpoint the nav row folds into a burger. What it
     opens is the very same wrapper the links and the button already live in,
     so no navigation markup is duplicated - only its presentation changes,
     and it is CSS that decides when that presentation applies.
     --------------------------------------------------------------------- */
  var menus = [];

  function setMenu(entry, open) {
    entry.menu.classList.toggle('is-open', open);
    entry.burger.setAttribute('aria-expanded', String(open));
    entry.burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function closeMenus(restoreFocus) {
    menus.forEach(function (entry) {
      if (!entry.menu.classList.contains('is-open')) return;
      setMenu(entry, false);
      if (restoreFocus) entry.burger.focus();
    });
  }

  function openMenu(entry) {
    menus.forEach(function (other) {
      if (other !== entry) setMenu(other, false);
    });
    setMenu(entry, true);

    /* on the next frame: the surface is out of `visibility: hidden` by then,
       and a pointer-driven focus on the burger has already settled */
    var first = entry.menu.querySelector('a');
    if (first) requestAnimationFrame(function () { first.focus(); });
  }

  Array.prototype.forEach.call(
    document.querySelectorAll('.navburger'),
    function (burger) {
      var menu = document.getElementById(burger.getAttribute('aria-controls'));
      if (!menu) return;

      var entry = { burger: burger, menu: menu };
      menus.push(entry);

      burger.addEventListener('click', function () {
        if (menu.classList.contains('is-open')) closeMenus(false);
        else openMenu(entry);
      });

      /* picking a destination closes the menu behind it */
      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) closeMenus(false);
      });
    }
  );

  document.addEventListener('click', function (e) {
    for (var i = 0; i < menus.length; i++) {
      if (menus[i].menu.contains(e.target) ||
          menus[i].burger.contains(e.target)) return;
    }
    closeMenus(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenus(true);
  });

  /* leaving the tablet band puts the links back in the bar themselves */
  var tabletQuery = window.matchMedia('(max-width: 1199.98px)');
  function onBandChange() {
    if (!tabletQuery.matches) closeMenus(false);
    /* crossing the breakpoint hands the globe between the entrance sequence
       and its own loop */
    syncVideoMotion();
  }
  if (tabletQuery.addEventListener) tabletQuery.addEventListener('change', onBandChange);
  else if (tabletQuery.addListener) tabletQuery.addListener(onBandChange);

  /* ---------------------------------------------------------------------
     5. Showcase dots - the Figma frame defines a selected and an unselected
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
