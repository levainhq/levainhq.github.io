/**
 * site.js — theme + the motion layer
 *
 * The interaction pizzazz (neural pulse glow, card tilt, click ripples,
 * orbs, Conway's Life, console easter eggs) lives in the original scripts:
 * interactions.js, game-of-life-footer.js, founder-mode.js,
 * console-features.js — all restored verbatim.
 *
 * This file adds what those didn't cover: scroll reveals, the hero
 * entrance, seam draws, magnetic links, and lazy-init for the footer
 * simulation. All of it registers as the "up" state that Founder Mode
 * turns DOWN — a dial with nothing above zero is not a dial.
 */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    var sync = function () {
      toggle.textContent =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    };
    toggle.addEventListener("click", function () {
      if (root.getAttribute("data-theme") === "dark") {
        root.removeAttribute("data-theme");
        localStorage.setItem("theme-preference", "light");
      } else {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem("theme-preference", "dark");
      }
      sync();
      refireSeams();
    });
    sync();
  }

  /* The laser trick, carried over from Adaptive Human: a divider that
     reacts to a state change is doing work a static rule never does. On
     theme toggle the seams retract and fire again in the new colour. */
  function refireSeams() {
    if (root.classList.contains("motion-off")) return;
    document.querySelectorAll("hr.seam.reveal").forEach(function (s, i) {
      s.classList.remove("shown");
      setTimeout(function () {
        s.classList.add("shown");
      }, 120 + i * 60);
    });
  }

  if (reduced) {
    root.classList.add("motion-off");
    return;
  }

  /* ---------- Hero entrance: staggered rise on load ---------- */
  var heroBits = document.querySelectorAll(
    ".eyebrow, .wordmark, .hero-claim, .hero-sub, .hero-links, .page-title, .page-lede"
  );
  heroBits.forEach(function (el, i) {
    el.classList.add("rise");
    setTimeout(function () {
      el.classList.add("risen");
    }, 90 + i * 110);
  });

  /* ---------- Scroll reveal ---------- */
  var targets = document.querySelectorAll(
    ".row, .card, .route, .piece, .rundown-item, .poem, .chapter-title, .section-title, .connect-item, .seam"
  );
  targets.forEach(function (el) {
    el.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          // stagger siblings so a grid cascades instead of snapping in
          var sibs = el.parentElement
            ? Array.prototype.indexOf.call(el.parentElement.children, el)
            : 0;
          setTimeout(function () {
            el.classList.add("shown");
          }, Math.min(sibs, 5) * 70);
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  } else {
    targets.forEach(function (el) {
      el.classList.add("shown");
    });
  }

  /* ---------- Magnetic hero links ---------- */
  document.querySelectorAll(".hero-links a, .cta-band a").forEach(function (a) {
    a.addEventListener("mousemove", function (e) {
      var r = a.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      a.style.transform = "translate(" + dx * 7 + "px," + dy * 5 + "px)";
    });
    a.addEventListener("mouseleave", function () {
      a.style.transform = "";
    });
  });

  /* ---------- Lazy-init the footer simulation ---------- */
  var life = document.getElementById("life-canvas");
  if (life && "IntersectionObserver" in window) {
    life.dataset.lazy = "pending";
    var lio = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          life.dataset.lazy = "live";
          window.dispatchEvent(new CustomEvent("life:visible"));
          lio.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    lio.observe(life);
  }

  /* ---------- Founder Mode turns all of the above DOWN ---------- */
  window.addEventListener("founderModeChange", function (e) {
    root.classList.toggle("motion-off", !e.detail.active);
  });
})();
