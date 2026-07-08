/* ===========================================================
   MAGIC BENTO GRID — Vanilla JS Engine
   Converted from React Bits MagicBento component
   Uses GSAP for particle, tilt, magnetism, and ripple animations
   Gold-themed (212, 175, 55) for The Lands Between
   =========================================================== */

(function () {
  'use strict';

  /* ── Configuration ── */
  const GLOW_COLOR = '212, 175, 55';          // Gold
  const PARTICLE_COUNT = 12;
  const SPOTLIGHT_RADIUS = 300;
  const MOBILE_BREAKPOINT = 768;
  const ENABLE_TILT = false;
  const ENABLE_MAGNETISM = true;
  const ENABLE_CLICK_EFFECT = true;
  const ENABLE_PARTICLES = true;
  const ENABLE_SPOTLIGHT = true;
  const ENABLE_BORDER_GLOW = true;
  const TEXT_AUTO_HIDE = true;

  /* ── Soulslike-Themed Card Data ── */
  const CARD_DATA = [
    {
      label: 'Craftsmanship',
      title: 'Hand-Sculpted',
      description: 'Every detail shaped by master artisans',
      bgImage: 'assets/images/lady_maria_statue.png'
    },
    {
      label: 'Authenticity',
      title: 'Lore-Faithful',
      description: 'Verified by dedicated lore archivists',
      bgImage: 'assets/images/dark-souls.jpg'
    },
    {
      label: 'Exclusivity',
      title: 'Limited Editions',
      description: 'Individually numbered collector pieces with worldwide caps',
      bgImage: 'assets/images/radahn_starscourge.jpg'
    },
    {
      label: 'Quality',
      title: 'Museum-Grade Resin',
      description: 'Premium cold-cast materials with hand-painted finishes that endure',
      bgImage: 'assets/images/artorias_statue.png'
    },
    {
      label: 'Protection',
      title: 'Secure Packaging',
      description: 'Foam-cradled museum crates for safe transit',
      bgImage: 'assets/images/bloodborne.jpg'
    },
    {
      label: 'Community',
      title: 'Covenant of Collectors',
      description: 'Join a fellowship bound by reverence for Soulslike worlds',
      bgImage: 'assets/images/malenia_statue.png'
    }
  ];

  /* ── Utility: check if mobile or reduced motion ── */
  function shouldDisableAnimations() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    return false;
  }

  /* ── Utility: create particle DOM element ── */
  function createParticleEl(x, y) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText =
      'position:absolute;width:4px;height:4px;border-radius:50%;' +
      'background:rgba(' + GLOW_COLOR + ',1);' +
      'box-shadow:0 0 6px rgba(' + GLOW_COLOR + ',0.6);' +
      'pointer-events:none;z-index:100;' +
      'left:' + x + 'px;top:' + y + 'px;';
    return el;
  }

  /* ── Utility: spotlight proximity calculation ── */
  function spotlightValues(radius) {
    return {
      proximity: radius * 0.5,
      fadeDistance: radius * 0.75
    };
  }

  /* ── Utility: update card glow CSS custom properties ── */
  function setCardGlow(card, mouseX, mouseY, glow, radius) {
    const rect = card.getBoundingClientRect();
    const rx = ((mouseX - rect.left) / rect.width) * 100;
    const ry = ((mouseY - rect.top) / rect.height) * 100;
    card.style.setProperty('--glow-x', rx + '%');
    card.style.setProperty('--glow-y', ry + '%');
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', radius + 'px');
  }

  /* ═══════════════════════════════════════════════
     Build the Bento HTML into each .bento-section
     ═══════════════════════════════════════════════ */
  function buildBentoGrid(container) {
    // Create the card-grid wrapper
    const grid = document.createElement('div');
    grid.className = 'card-grid bento-section-grid';

    CARD_DATA.forEach(function (card) {
      const classes = [
        'magic-bento-card',
        TEXT_AUTO_HIDE ? 'magic-bento-card--text-autohide' : '',
        ENABLE_BORDER_GLOW ? 'magic-bento-card--border-glow' : '',
        ENABLE_PARTICLES ? 'particle-container' : ''
      ].filter(Boolean).join(' ');

      const el = document.createElement('div');
      el.className = classes;
      el.style.backgroundColor = 'var(--surface, #151412)';
      el.style.setProperty('--glow-color', GLOW_COLOR);

      el.innerHTML =
        '<div class="magic-bento-card__bg"><img src="' + card.bgImage + '" alt=""></div>' +
        '<div class="magic-bento-card__header">' +
          '<div class="magic-bento-card__label">' + card.label + '</div>' +
        '</div>' +
        '<div class="magic-bento-card__content">' +
          '<h2 class="magic-bento-card__title">' + card.title + '</h2>' +
          '<p class="magic-bento-card__description">' + card.description + '</p>' +
        '</div>';

      grid.appendChild(el);
    });

    // Append inside the .container div if present, otherwise directly to the section
    var target = container.querySelector('.container') || container;
    target.appendChild(grid);
    return grid;
  }

  /* ═══════════════════════════════════════════════
     Particle System per Card
     ═══════════════════════════════════════════════ */
  function initParticleCard(card) {
    let particles = [];
    let timeouts = [];
    let isHovered = false;
    let templates = null;

    function initTemplates() {
      if (templates) return;
      const rect = card.getBoundingClientRect();
      templates = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        templates.push(createParticleEl(
          Math.random() * rect.width,
          Math.random() * rect.height
        ));
      }
    }

    function clearParticles() {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      particles.forEach(function (p) {
        gsap.to(p, {
          scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)',
          onComplete: function () { if (p.parentNode) p.parentNode.removeChild(p); }
        });
      });
      particles = [];
    }

    function spawnParticles() {
      if (!isHovered) return;
      initTemplates();

      templates.forEach(function (tmpl, i) {
        var tid = setTimeout(function () {
          if (!isHovered) return;
          var clone = tmpl.cloneNode(true);
          card.appendChild(clone);
          particles.push(clone);

          gsap.fromTo(clone,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
          );
          gsap.to(clone, {
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            rotation: Math.random() * 360,
            duration: 2 + Math.random() * 2,
            ease: 'none', repeat: -1, yoyo: true
          });
          gsap.to(clone, {
            opacity: 0.3, duration: 1.5,
            ease: 'power2.inOut', repeat: -1, yoyo: true
          });
        }, i * 100);
        timeouts.push(tid);
      });
    }

    card.addEventListener('mouseenter', function () {
      if (shouldDisableAnimations()) return;
      isHovered = true;
      spawnParticles();
      if (ENABLE_TILT) {
        gsap.to(card, { rotateX: 5, rotateY: 5, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
      }
    });

    card.addEventListener('mouseleave', function () {
      isHovered = false;
      clearParticles();
      if (ENABLE_TILT) {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
      }
      if (ENABLE_MAGNETISM) {
        gsap.to(card, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
      }
    });

    card.addEventListener('mousemove', function (e) {
      if (shouldDisableAnimations()) return;
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;

      if (ENABLE_TILT) {
        gsap.to(card, {
          rotateX: ((y - cy) / cy) * -10,
          rotateY: ((x - cx) / cx) * 10,
          duration: 0.1, ease: 'power2.out', transformPerspective: 1000
        });
      }
      if (ENABLE_MAGNETISM) {
        gsap.to(card, {
          x: (x - cx) * 0.05,
          y: (y - cy) * 0.05,
          duration: 0.3, ease: 'power2.out'
        });
      }
    });

    if (ENABLE_CLICK_EFFECT) {
      card.addEventListener('click', function (e) {
        if (shouldDisableAnimations()) return;
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var maxD = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height)
        );
        var ripple = document.createElement('div');
        ripple.style.cssText =
          'position:absolute;width:' + (maxD * 2) + 'px;height:' + (maxD * 2) + 'px;' +
          'border-radius:50%;pointer-events:none;z-index:1000;' +
          'background:radial-gradient(circle,rgba(' + GLOW_COLOR + ',0.4) 0%,rgba(' + GLOW_COLOR + ',0.2) 30%,transparent 70%);' +
          'left:' + (x - maxD) + 'px;top:' + (y - maxD) + 'px;';
        card.appendChild(ripple);
        gsap.fromTo(ripple,
          { scale: 0, opacity: 1 },
          { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: function () { ripple.remove(); } }
        );
      });
    }
  }

  /* ═══════════════════════════════════════════════
     Global Spotlight (Site-wide)
     Follows cursor and activates near ANY card (bento, product, category)
     ═══════════════════════════════════════════════ */
  function initGlobalSpotlightAndGlow() {
    var GLOW_SELECTORS = '.magic-bento-card, .product-card, .category-card, .carousel-slide, .filters';

    var spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText =
      'position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;' +
      'background:radial-gradient(circle,' +
        'rgba(' + GLOW_COLOR + ',0.12) 0%,' +
        'rgba(' + GLOW_COLOR + ',0.06) 15%,' +
        'rgba(' + GLOW_COLOR + ',0.03) 25%,' +
        'rgba(' + GLOW_COLOR + ',0.015) 40%,' +
        'rgba(' + GLOW_COLOR + ',0.008) 65%,' +
        'transparent 70%' +
      ');z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;';
    document.body.appendChild(spotlight);

    // Track active cards for border glow
    function attachGlowToElements(elements) {
      elements.forEach(function(el) {
        if (el._glowInitialized) return;
        el._glowInitialized = true;

        el.addEventListener('mousemove', function (e) {
          var rect = el.getBoundingClientRect();
          var rx = ((e.clientX - rect.left) / rect.width) * 100;
          var ry = ((e.clientY - rect.top) / rect.height) * 100;
          el.style.setProperty('--glow-x', rx + '%');
          el.style.setProperty('--glow-y', ry + '%');
          el.style.setProperty('--glow-intensity', '1');
        });

        el.addEventListener('mouseleave', function () {
          el.style.setProperty('--glow-intensity', '0');
        });
      });
    }

    // Attach to existing elements
    var getCards = function() { return document.querySelectorAll(GLOW_SELECTORS); };
    attachGlowToElements(getCards());

    // Watch for dynamically inserted elements
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(GLOW_SELECTORS)) {
            attachGlowToElements([node]);
          }
          if (node.querySelectorAll) {
            attachGlowToElements(node.querySelectorAll(GLOW_SELECTORS));
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Global Mouse Move for Spotlight
    document.addEventListener('mousemove', function (e) {
      if (shouldDisableAnimations()) return;

      var cards = getCards();
      var sv = spotlightValues(SPOTLIGHT_RADIUS);
      var minDist = Infinity;
      var activeContainer = false;

      cards.forEach(function (card) {
        var cr = card.getBoundingClientRect();
        // Check if cursor is near this card
        var centerX = cr.left + cr.width / 2;
        var centerY = cr.top + cr.height / 2;
        var dist = Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cr.width, cr.height) / 2;
        var eDist = Math.max(0, dist);
        minDist = Math.min(minDist, eDist);

        if (eDist <= sv.fadeDistance) {
          activeContainer = true;
        }

        // The border glow intensity is handled by mousemove on the card itself,
        // but we can also update proximity glow for Bento cards if needed.
        if (card.classList.contains('magic-bento-card')) {
          var glow = 0;
          if (eDist <= sv.proximity) glow = 1;
          else if (eDist <= sv.fadeDistance) glow = (sv.fadeDistance - eDist) / (sv.fadeDistance - sv.proximity);
          setCardGlow(card, e.clientX, e.clientY, glow, SPOTLIGHT_RADIUS);
        }
      });

      if (!activeContainer) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        return;
      }

      gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });

      var targetOp = 0;
      if (minDist <= sv.proximity) {
        targetOp = 0.8;
      } else if (minDist <= sv.fadeDistance) {
        targetOp = ((sv.fadeDistance - minDist) / (sv.fadeDistance - sv.proximity)) * 0.8;
      }
      gsap.to(spotlight, {
        opacity: targetOp,
        duration: targetOp > 0 ? 0.2 : 0.5,
        ease: 'power2.out'
      });
    });

    document.addEventListener('mouseleave', function () {
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    });
  }

  /* ═══════════════════════════════════════════════
     Initialize all .bento-section containers on page
     ═══════════════════════════════════════════════ */
  function init() {
    var sections = document.querySelectorAll('.bento-section');

    sections.forEach(function (section) {
      var grid = buildBentoGrid(section);
      if (ENABLE_PARTICLES && typeof gsap !== 'undefined') {
        grid.querySelectorAll('.magic-bento-card').forEach(initParticleCard);
      }
    });

    // Initialize the global spotlight and hover effects for ALL cards
    if (ENABLE_SPOTLIGHT && typeof gsap !== 'undefined') {
      initGlobalSpotlightAndGlow();
    }
  }

  /* Run on DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
