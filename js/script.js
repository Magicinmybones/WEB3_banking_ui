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
  var MOBILE_BREAKPOINT = 900;

  var viewport = document.getElementById('viewport');
  var stage = document.getElementById('stage');

  /* ---------------------------------------------------------------------
     1. Scaling
     Above the artboard width the design renders 1:1. Below it the whole
     stage is scaled, which keeps every proportion identical to Figma.
     Under the mobile breakpoint the stage reflows instead, and only the
     individual feature cards - which are pixel-locked compositions - are
     scaled to the width of the single column.
     --------------------------------------------------------------------- */
  function layout() {
    var width = document.documentElement.clientWidth;

    if (width > MOBILE_BREAKPOINT) {
      var scale = Math.min(1, width / DESIGN_WIDTH);
      stage.style.setProperty('--scale', scale);

      /* Release the height before measuring: the scale is only a paint-time
         transform, so the wrapper has to be told how tall the result is, and
         that measurement must never be taken while the previous answer is
         still constraining the stage. */
      viewport.style.height = 'auto';
      viewport.style.height = stage.offsetHeight * scale + 'px';
    } else {
      stage.style.removeProperty('--scale');
      viewport.style.removeProperty('height');
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
  window.addEventListener('load', layout);
  layout();

  /* ---------------------------------------------------------------------
     2. Navigation
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
     3. Showcase dots - the Figma frame defines a selected and an unselected
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
