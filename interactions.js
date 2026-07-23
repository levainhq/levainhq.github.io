/**
 * Interactions.js - Sessions 1 & 2: Foundation + Hover Effects + Card Tilt + Ripples
 *
 * Handles:
 * - Neural pulse hover glow (distance-based intensity)
 * - Link underline spectrum gradient animations
 * - Card 3D tilt effects (Apple-style, mouse position-based)
 * - Click ripple system (Material Design-style, spectrum gradient)
 * - Mobile device orientation support (gyroscope tilt)
 * - Performance-optimized event handling
 *
 * Design Philosophy: "Make the quiet parts louder, not the loud parts deafening"
 * Chrome Performance: Keep animated layer count LOW, use CSS custom properties
 */

(function() {
  'use strict';

  /* ========================================
     CONFIGURATION
     ======================================== */

  const CONFIG = {
    // Neural Pulse Glow
    glowMaxDistance: 500,      // Maximum distance (px) for glow effect
    glowMinDistance: 0,         // Minimum distance for full glow
    glowUpdateThrottle: 16,     // Throttle mousemove to 60fps (16ms)

    // Card 3D Tilt (Session 2)
    tiltMaxDegrees: 5,          // Maximum tilt angle (±5 degrees, organic feel)
    tiltSmoothness: 0.1,        // Lerp factor (0.1 = smooth, 0.5 = snappy)
    tiltUpdateThrottle: 16,     // Throttle mousemove to 60fps (16ms)

    // Click Ripples (Session 2)
    rippleMaxConcurrent: 3,     // Maximum number of concurrent ripples
    rippleDuration: 1000,       // Ripple animation duration (ms)
    rippleSize: 300,            // Maximum ripple diameter (px)

    // Performance
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };

  /* ========================================
     PERFORMANCE UTILITIES
     ======================================== */

  /**
   * Throttle function - Limits function execution to once per interval
   * @param {Function} func - Function to throttle
   * @param {Number} wait - Milliseconds to wait between executions
   * @returns {Function} - Throttled function
   */
  function throttle(func, wait) {
    let timeout = null;
    let previous = 0;

    return function(...args) {
      const now = Date.now();
      const remaining = wait - (now - previous);

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          func.apply(this, args);
        }, remaining);
      }
    };
  }

  /**
   * Request Animation Frame wrapper with fallback
   */
  const requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function(callback) { window.setTimeout(callback, 1000 / 60); };
  })();

  /* ========================================
     NEURAL PULSE HOVER GLOW
     ======================================== */

  class NeuralPulseGlow {
    constructor() {
      this.pulseElement = document.querySelector('.cognitive-pulse');
      this.pulseCenter = { x: 0, y: 0 };
      this.currentIntensity = 0;
      this.targetIntensity = 0;
      this.isAnimating = false;

      // Skip initialization on mobile or if reduced motion preferred
      if (CONFIG.isMobile || CONFIG.prefersReducedMotion || !this.pulseElement) {
        return;
      }

      this.init();
    }

    /**
     * Initialize the glow system
     */
    init() {
      this.calculatePulseCenter();
      this.attachEventListeners();

      // Recalculate center on window resize
      window.addEventListener('resize', throttle(() => {
        this.calculatePulseCenter();
      }, 250));
    }

    /**
     * Calculate the center point of the neural pulse
     */
    calculatePulseCenter() {
      if (!this.pulseElement) return;

      const rect = this.pulseElement.getBoundingClientRect();
      this.pulseCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    /**
     * Attach mousemove listener (throttled for performance)
     */
    attachEventListeners() {
      const throttledMouseMove = throttle((e) => {
        this.handleMouseMove(e);
      }, CONFIG.glowUpdateThrottle);

      document.addEventListener('mousemove', throttledMouseMove, { passive: true });
    }

    /**
     * Handle mouse movement and update glow intensity
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
      // Calculate distance from mouse to pulse center
      const distance = Math.sqrt(
        Math.pow(e.clientX - this.pulseCenter.x, 2) +
        Math.pow(e.clientY - this.pulseCenter.y, 2)
      );

      // Calculate intensity (1.0 at center, 0.0 at maxDistance)
      // Uses inverse square falloff for natural feel
      let intensity = 0;
      if (distance < CONFIG.glowMaxDistance) {
        // Linear falloff: 1.0 at min distance, 0.0 at max distance
        intensity = 1 - (distance / CONFIG.glowMaxDistance);

        // Apply easing for smoother falloff (ease-out cubic)
        intensity = 1 - Math.pow(1 - intensity, 3);
      }

      this.targetIntensity = intensity;

      // Start smooth animation if not already running
      if (!this.isAnimating) {
        this.animateGlow();
      }
    }

    /**
     * Smoothly animate glow intensity using requestAnimationFrame
     */
    animateGlow() {
      this.isAnimating = true;

      const animate = () => {
        // Smooth interpolation (lerp) towards target intensity
        const diff = this.targetIntensity - this.currentIntensity;

        if (Math.abs(diff) > 0.001) {
          this.currentIntensity += diff * 0.15; // Lerp factor (0.15 = smooth)
          this.updateGlowCSS();
          requestAnimFrame(animate);
        } else {
          this.currentIntensity = this.targetIntensity;
          this.updateGlowCSS();
          this.isAnimating = false;
        }
      };

      animate();
    }

    /**
     * Update CSS custom property for glow intensity
     */
    updateGlowCSS() {
      document.documentElement.style.setProperty('--glow-intensity', this.currentIntensity.toFixed(3));
    }
  }

  /* ========================================
     LINK UNDERLINE SPECTRUM ANIMATIONS
     ======================================== */

  class LinkUnderlineAnimations {
    constructor() {
      this.navLinks = document.querySelectorAll('.nav-links a, .social-links a');

      // Skip on mobile or if reduced motion preferred
      if (CONFIG.isMobile || CONFIG.prefersReducedMotion) {
        return;
      }

      this.init();
    }

    /**
     * Initialize link animations
     */
    init() {
      // Note: Spectrum gradient underline is handled via CSS
      // This class is a placeholder for future enhancements (e.g., dynamic gradients)

      // Add spectrum-underline class to all links for CSS targeting
      this.navLinks.forEach(link => {
        link.classList.add('spectrum-underline');
      });
    }
  }

  /* ========================================
     CARD 3D TILT - SESSION 2
     ======================================== */

  class Card3DTilt {
    constructor() {
      // Track initialized cards (use Set to avoid duplicates)
      this.initializedCards = new Set();
      this.activeCard = null;
      this.currentRotation = { x: 0, y: 0 };
      this.targetRotation = { x: 0, y: 0 };
      this.isAnimating = false;
      this.observer = null;

      // Skip on mobile (will use gyroscope instead) or if reduced motion preferred
      if (CONFIG.prefersReducedMotion) {
        return;
      }

      // Desktop: mouse-based tilt
      if (!CONFIG.isMobile) {
        // Initialize any existing cards
        this.initializeCards();

        // Watch for new cards being added (Protocol Memory loads them async)
        this.setupMutationObserver();
      } else {
        // Mobile: device orientation tilt (optional)
        this.initMobileTilt();
      }

      // Listen for Founder Mode changes (Session 3)
      this.setupFounderModeListener();
    }

    /**
     * Setup MutationObserver to watch for dynamically-added cards
     */
    setupMutationObserver() {
      this.observer = new MutationObserver((mutations) => {
        // Check if any new card elements were added
        let foundNewCards = false;
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if any added nodes are cards or contain cards
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // Element node
                if (this.isCardElement(node) || node.querySelector('.card, .route, .rundown-item, .piece, .connect-item')) {
                  foundNewCards = true;
                }
              }
            });
          }
        }

        if (foundNewCards) {
          this.initializeCards();
        }
      });

      // Observe the entire body for added cards
      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('[Card3DTilt] MutationObserver watching for dynamic cards');
    }

    /**
     * Setup listener for Founder Mode changes (Session 3)
     * Adjusts tilt range when Founder Mode is toggled
     */
    setupFounderModeListener() {
      window.addEventListener('founderModeChange', (event) => {
        const isActive = event.detail.active;

        // Adjust tilt range based on Founder Mode state
        // Normal mode: ±5 degrees (organic)
        // Founder mode: ±8 degrees (playful & energetic - Session 3B)
        CONFIG.tiltMaxDegrees = isActive ? 8 : 5;

        console.log(`[Card3DTilt] Founder Mode ${isActive ? 'activated' : 'deactivated'}: tilt range set to ±${CONFIG.tiltMaxDegrees}°`);
      });
    }

    /**
     * Check if an element is a card
     * @param {Element} element - Element to check
     * @returns {Boolean}
     */
    isCardElement(element) {
      return element.classList && (
        element.classList.contains('pm-project-item') ||
        element.classList.contains('pm-expertise-card') ||
        element.classList.contains('state-card') ||
        element.classList.contains('pm-state-item') // Current State cards
      );
    }

    /**
     * Initialize tilt on all cards (existing + new)
     */
    initializeCards() {
      // Include .pm-state-item for Current State section
      const cards = document.querySelectorAll('.card, .route, .rundown-item, .piece, .connect-item');
      let newCount = 0;

      cards.forEach(card => {
        if (!this.initializedCards.has(card)) {
          this.initializedCards.add(card);
          this.attachTiltListeners(card);
          newCount++;
        }
      });

      if (newCount > 0) {
        console.log('[Card3DTilt] Initialized tilt on', newCount, 'new cards (total:', this.initializedCards.size, ')');
      }
    }

    /**
     * Attach tilt event listeners to a card
     * @param {HTMLElement} card - The card element
     */
    attachTiltListeners(card) {
      // Add tiltable class for CSS targeting
      card.classList.add('tiltable-card');

      // Throttled mousemove for performance
      const throttledMouseMove = throttle((e) => {
        this.handleCardMouseMove(card, e);
      }, CONFIG.tiltUpdateThrottle);

      card.addEventListener('mouseenter', () => {
        this.activeCard = card;
      });

      card.addEventListener('mousemove', throttledMouseMove, { passive: true });

      card.addEventListener('mouseleave', () => {
        this.activeCard = null;
        this.resetTilt(card);
      });
    }


    /**
     * Handle mouse movement over card (calculate tilt)
     * @param {HTMLElement} card - The card element
     * @param {MouseEvent} e - Mouse event
     */
    handleCardMouseMove(card, e) {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      // Calculate mouse position relative to card center (-1 to 1 range)
      const relativeX = (e.clientX - cardCenterX) / (rect.width / 2);
      const relativeY = (e.clientY - cardCenterY) / (rect.height / 2);

      // Convert to rotation angles (±maxDegrees)
      // Invert Y axis for natural tilt (mouse up = card tilts back)
      this.targetRotation.x = -relativeY * CONFIG.tiltMaxDegrees;
      this.targetRotation.y = relativeX * CONFIG.tiltMaxDegrees;

      // Start smooth animation if not already running
      if (!this.isAnimating && this.activeCard === card) {
        this.animateTilt(card);
      }
    }

    /**
     * Smoothly animate tilt using requestAnimationFrame
     * @param {HTMLElement} card - The card element
     */
    animateTilt(card) {
      this.isAnimating = true;

      const animate = () => {
        // Smooth interpolation (lerp) towards target rotation
        const diffX = this.targetRotation.x - this.currentRotation.x;
        const diffY = this.targetRotation.y - this.currentRotation.y;

        if (Math.abs(diffX) > 0.1 || Math.abs(diffY) > 0.1) {
          this.currentRotation.x += diffX * CONFIG.tiltSmoothness;
          this.currentRotation.y += diffY * CONFIG.tiltSmoothness;
          this.applyTilt(card);

          if (this.activeCard === card) {
            requestAnimFrame(animate);
          } else {
            this.isAnimating = false;
          }
        } else {
          this.currentRotation.x = this.targetRotation.x;
          this.currentRotation.y = this.targetRotation.y;
          this.applyTilt(card);
          this.isAnimating = false;
        }
      };

      animate();
    }

    /**
     * Apply tilt transform to card (using CSS custom properties)
     * @param {HTMLElement} card - The card element
     */
    applyTilt(card) {
      // Use CSS custom properties instead of inline transform
      // This avoids conflicts with existing hover transforms
      card.style.setProperty('--tilt-x', `${this.currentRotation.x}deg`);
      card.style.setProperty('--tilt-y', `${this.currentRotation.y}deg`);
    }

    /**
     * Reset card tilt to neutral position
     * @param {HTMLElement} card - The card element
     */
    resetTilt(card) {
      this.targetRotation = { x: 0, y: 0 };
      this.currentRotation = { x: 0, y: 0 };
      // Reset CSS custom properties to 0
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    }

    /**
     * Initialize mobile device orientation tilt (optional enhancement)
     */
    initMobileTilt() {
      // Check if device orientation API is available
      if (!window.DeviceOrientationEvent) {
        console.log('[Card3DTilt] Device orientation not supported');
        return;
      }

      // Request permission on iOS 13+ (requires user interaction)
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS: requires explicit permission
        // Note: This would need a button click to trigger
        console.log('[Card3DTilt] Device orientation requires permission on iOS');
        return;
      }

      // Initialize any existing cards
      this.initializeCards();

      // Watch for new cards being added
      this.setupMutationObserver();

      // Android or older iOS: permission granted automatically
      window.addEventListener('deviceorientation', (e) => {
        this.handleDeviceOrientation(e);
      }, { passive: true });

      console.log('[Card3DTilt] Mobile device orientation tilt initialized');
    }

    /**
     * Handle device orientation change (gyroscope)
     * @param {DeviceOrientationEvent} e - Device orientation event
     */
    handleDeviceOrientation(e) {
      // Beta: front-to-back tilt (-180 to 180)
      // Gamma: left-to-right tilt (-90 to 90)
      const beta = e.beta;   // Front-back tilt
      const gamma = e.gamma; // Left-right tilt

      // Normalize to ±1 range
      const normalizedBeta = Math.max(-1, Math.min(1, beta / 45));
      const normalizedGamma = Math.max(-1, Math.min(1, gamma / 45));

      // Apply subtle tilt to all tracked cards (ambient effect)
      this.initializedCards.forEach(card => {
        const tiltX = normalizedBeta * CONFIG.tiltMaxDegrees * 0.5; // 50% of max
        const tiltY = normalizedGamma * CONFIG.tiltMaxDegrees * 0.5;

        // Use CSS custom properties (same as desktop)
        card.style.setProperty('--tilt-x', `${tiltX}deg`);
        card.style.setProperty('--tilt-y', `${tiltY}deg`);
      });
    }
  }

  /* ========================================
     WATER RIPPLES - SESSION 2 FIX
     ======================================== */

  class WaterRipples {
    constructor() {
      this.activeRipples = [];
      this.rippleContainer = null;

      // Skip if reduced motion preferred
      if (CONFIG.prefersReducedMotion) {
        return;
      }

      this.init();
    }

    /**
     * Initialize water ripple system
     */
    init() {
      // Create ripple container (appended to body)
      this.rippleContainer = document.createElement('div');
      this.rippleContainer.className = 'ripple-container';
      this.rippleContainer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.rippleContainer);

      // Listen for clicks anywhere on the page
      // User feedback: wants ripples everywhere, not just specific elements
      document.addEventListener('click', (e) => {
        this.createWaterRipple(e.clientX, e.clientY);
      }, { passive: true });

      console.log('[WaterRipples] Subtle water ripple system initialized');
    }

    /**
     * Create water ripple at click coordinates (3 concentric rings)
     * @param {Number} x - Click X coordinate
     * @param {Number} y - Click Y coordinate
     */
    createWaterRipple(x, y) {
      // Create 3 concentric rings with staggered timing (like water ripples)
      for (let i = 0; i < 3; i++) {
        const ring = document.createElement('div');
        ring.className = 'water-ripple';
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        ring.style.animationDelay = `${i * 80}ms`; // Stagger: 0ms, 80ms, 160ms

        // Add to container
        this.rippleContainer.appendChild(ring);

        // Track active ripple
        const rippleData = {
          element: ring,
          timestamp: Date.now()
        };
        this.activeRipples.push(rippleData);

        // Auto-remove after animation completes
        const duration = 500 + (i * 80); // 500ms, 580ms, 660ms
        setTimeout(() => {
          if (ring.parentNode) {
            ring.remove();
          }
          // Remove from tracking array
          const index = this.activeRipples.indexOf(rippleData);
          if (index > -1) {
            this.activeRipples.splice(index, 1);
          }
        }, duration);
      }

      // Limit total concurrent ripples (cleanup oldest if needed)
      if (this.activeRipples.length > CONFIG.rippleMaxConcurrent * 3) {
        // Remove oldest ripples
        const toRemove = this.activeRipples.splice(0, 3);
        toRemove.forEach(rippleData => {
          if (rippleData.element.parentNode) {
            rippleData.element.remove();
          }
        });
      }
    }
  }

  /* ========================================
     INITIALIZATION
     ======================================== */

  /**
   * Initialize all interactions when DOM is ready
   */
  function initInteractions() {
    // Check if we should skip interactions (reduced motion)
    // Note: We no longer skip ALL interactions on mobile - some work on touch!
    if (CONFIG.prefersReducedMotion) {
      console.log('[Interactions] Reduced motion preference detected - skipping animations');
      return;
    }

    // Initialize Neural Pulse Glow (desktop only)
    let neuralGlow = null;
    if (!CONFIG.isMobile) {
      neuralGlow = new NeuralPulseGlow();
      console.log('[Interactions] Neural pulse glow initialized');
    }

    // Initialize Link Underline Animations (desktop only)
    let linkAnimations = null;
    if (!CONFIG.isMobile) {
      linkAnimations = new LinkUnderlineAnimations();
      console.log('[Interactions] Link underline animations initialized');
    }

    // Initialize Card 3D Tilt (Session 2 FIX) - works on desktop + mobile
    const cardTilt = new Card3DTilt();
    console.log('[Interactions] Card 3D tilt initialized');

    // Water Ripples: RETIRED 2026-07-19, superseded by experiment-orbs.js.
    //
    // Two reasons, not one. First, the effect had been dead since the design-
    // system migration: `.water-ripple` and `.ripple-container` were styled in
    // site-overrides.css, which was deleted, so this system had been appending
    // unstyled divs to the DOM on every click and removing them 500ms later —
    // invisible churn, no visual. Second, the replacement does the same job
    // better: the same staggered concentric expansion, but coloured by the
    // section you clicked in, which the neutral grey rings could never do.
    //
    // The class is left intact below so the behaviour is recoverable; it is
    // simply no longer instantiated. Original CSS: `git show 083147a:site-overrides.css`.
    const waterRipples = null;

    // Expose for debugging (optional)
    if (window.pmIntegration) {
      window.pmIntegration.interactions = {
        neuralGlow,
        linkAnimations,
        cardTilt,
        waterRipples,
        config: CONFIG
      };
    }
  }

  /* ========================================
     DOM READY
     ======================================== */

  // Initialize when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractions);
  } else {
    // DOM already loaded
    initInteractions();
  }

})();
