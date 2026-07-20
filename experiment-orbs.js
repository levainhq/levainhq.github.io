/**
 * Experiment Orbs — Click Effect System
 *
 * Ported from the archived Adapt Human site (scripts/experiment-orbs.js,
 * Nov 2025). The mechanism is copied as-is: three orbs per click, staggered
 * 80ms, expanding and fading over 800ms, capped at 12 concurrent, spawned at
 * the pointer and suppressed on interactive elements.
 *
 * THREE THINGS CHANGED IN THE PORT, and only these:
 *
 * 1. COLOR SOURCE. The donor mapped orbs to Adapt Human's brand (teal,
 *    burnt orange, purple). Those colors do not exist in this estate. Here the
 *    orb reads its color from the live design tokens at click time, so it
 *    follows the palette, the light/dark switch, and any future token change
 *    without a second copy of the palette living in JavaScript.
 *
 * 2. WHICH POLE, AND WHY. tokens.css is a two-pole system — kintsugi gold and
 *    verdigris patina, mediated by neutral ground — and site.css already
 *    assigns those poles a meaning: patina carries the evidence register
 *    (.receipt, .card-meta, .status--live, .rundown-meta, .principle-subtitle
 *    are all patina), gold carries the claim register (headings, seams, links).
 *    That is govern-not-trust already encoded in the palette, so the orb map
 *    follows it rather than inventing a new axis: claim-register sections
 *    spark gold, evidence-register sections spark patina, and the ledger —
 *    which is literally the claim|receipt pair — sparks gold into patina.
 *
 * 3. DARK MODE. The donor branched on `body.dark-mode` in JS. This site
 *    switches on `:root[data-theme="dark"]`, and the branch belongs in CSS
 *    anyway, so it lives in site.css and this file no longer tests for it.
 *
 * Founder Mode turns orbs DOWN, not off — consistent with the toggle's own
 * inversion. Reduced motion disables them outright.
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return;

  const MAX_ORBS = 12; // Max concurrent orbs (4 sets of 3)
  const ORBS_PER_CLICK = 3; // Orbs spawned per click
  const SPAWN_DELAY = 80; // ms between each orb in a set
  const ORB_DURATION = 800; // ms animation duration (matches CSS)

  let activeOrbs = [];

  /* ------------------------------------------------------------------
     Token access. Values are read live so light/dark and any palette
     edit propagate without a duplicate palette in JS.
     ------------------------------------------------------------------ */

  function token(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  /**
   * #rrggbb -> rgba(r, g, b, a). The donor concatenated hex alpha suffixes
   * onto its literals, which silently produces an invalid color the moment a
   * token is not 6-digit hex. Parsing is the same result and does not care.
   */
  function withAlpha(color, alpha) {
    const hex = color.replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(hex)) return color;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /* ------------------------------------------------------------------
     The register map. Section id (or page, for the depth pages whose
     chapters are unnamed) -> which pole of the palette it sparks.

     "claim"    -> gold: the assertion, the voice, the spine.
     "receipt"  -> patina: evidence, versions, status, closure.
     "pair"     -> gold into patina: a claim carrying its receipt.

     One object, one line each. Retune by editing this, nothing else.
     ------------------------------------------------------------------ */

  const SECTION_REGISTER = {
    hero: "claim", // the pitch, stated
    ledger: "pair", // claim | receipt, the whole point of the grid
    architecture: "claim", // what the product IS — description, not evidence
    floor: "receipt", // the confinement floor: mechanisms and line counts
    boundaries: "receipt", // what it does NOT do — the sharpest evidence here
    install: "claim",
    "build-on-it": "claim",
    audience: "claim",
  };

  const PAGE_REGISTER = {
    index: "claim",
  };

  function pageRegister() {
    const file = (location.pathname.split("/").pop() || "index").replace(
      /\.html$/,
      ""
    );
    return PAGE_REGISTER[file] || "claim";
  }

  /**
   * Resolve the register for a click target, then turn it into colors.
   * Section id wins; a depth page's unnamed chapters fall back to the page.
   */
  function getSectionColor(target) {
    const section = target.closest ? target.closest("section") : null;

    let register;
    if (section && section.classList.contains("hero")) {
      register = SECTION_REGISTER.hero;
    } else if (section && section.id && SECTION_REGISTER[section.id]) {
      register = SECTION_REGISTER[section.id];
    } else {
      register = pageRegister();
    }

    const gold = token("--gold") || "#c9a961";
    const goldBright = token("--gold-bright") || "#e3c77e";
    const patina = token("--patina") || "#4a8a78";
    const patinaBright = token("--patina-bright") || "#6bb39d";

    if (register === "receipt") {
      return { primary: patina, secondary: patinaBright, tertiary: patina };
    }
    if (register === "pair") {
      return { primary: gold, secondary: goldBright, tertiary: patina };
    }
    return { primary: gold, secondary: goldBright, tertiary: gold };
  }

  /* ------------------------------------------------------------------
     Orb lifecycle — unchanged from the donor.
     ------------------------------------------------------------------ */

  function createOrb(x, y, colors) {
    // Don't spawn if we're at max capacity
    if (activeOrbs.length >= MAX_ORBS) {
      const oldestOrb = activeOrbs.shift();
      if (oldestOrb && oldestOrb.parentNode) {
        oldestOrb.remove();
      }
    }

    const orb = document.createElement("div");
    orb.className = "experiment-orb";
    orb.setAttribute("aria-hidden", "true");
    orb.style.left = x + "px";
    orb.style.top = y + "px";

    // Light mode uses the ring outline; dark mode uses the filled gradient.
    orb.style.setProperty("--orb-color", colors.primary);
    orb.style.setProperty(
      "--orb-color-secondary",
      withAlpha(colors.secondary, 0.19)
    );
    orb.style.setProperty(
      "--orb-color-tertiary",
      withAlpha(colors.tertiary, 0.12)
    );

    document.body.appendChild(orb);
    activeOrbs.push(orb);

    setTimeout(() => {
      orb.remove();
      activeOrbs = activeOrbs.filter((o) => o !== orb);
    }, ORB_DURATION);
  }

  function spawnOrbSet(x, y, colors) {
    for (let i = 0; i < ORBS_PER_CLICK; i++) {
      setTimeout(() => {
        // Slight random offset for organic feel
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        createOrb(x + offsetX, y + offsetY, colors);
      }, i * SPAWN_DELAY);
    }
  }

  function isInteractive(el) {
    return el && el.closest && el.closest("button, a, input, textarea, select");
  }

  function handleClick(e) {
    // Don't spawn orbs on interactive elements. The donor used matches(),
    // which misses a click landing on a <span> inside a link — and every
    // card link on this site wraps text in child elements.
    if (isInteractive(e.target)) return;

    const colors = getSectionColor(e.target);
    spawnOrbSet(e.clientX, e.clientY, colors);
  }

  function handleTouch(e) {
    if (isInteractive(e.target)) return;

    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const colors = getSectionColor(e.target);
      spawnOrbSet(touch.clientX, touch.clientY, colors);
    }
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("touchstart", handleTouch, { passive: true });
})();
