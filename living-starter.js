/**
 * living-starter.js — levainhq.com hero field.
 *
 * A living starter culture. A protected core at the centre seeds cells of gold
 * and patina light that bud, drift, and link into an accreting network — sparse
 * at first, then densifying over the opening seconds (the seed rising), then
 * holding in a fed equilibrium where births balance deaths. The culture is
 * bounded by a soft membrane it never overruns, and the core stays inviolate.
 *
 * Levain's three claims in one figure: ship the seed not the fossil (it grows,
 * it is never static), memory accretes (the network densifies), it is governed
 * (the membrane holds, the core is protected). Not the person's pulse — the
 * product's own signature. Kin by system, distinct by centrepiece.
 *
 * Decorative by contract: the hero text carries all meaning. If this file fails
 * or is disabled nothing is lost. Honours prefers-reduced-motion and .motion-off
 * by rendering a single mature frame with no loop. Pauses off-screen and when
 * the tab is hidden. Palette is hardcoded from tokens.css — canvas cannot cheaply
 * resolve CSS vars — so if the gold/patina tokens change, change them here too.
 */
(function () {
  "use strict";

  var canvas = document.getElementById("starter-field");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cx = 0, cy = 0, R = 0, MAX = 60, LINK = 90;
  var cells = [];
  var t = 0;
  var mx = -1e5, my = -1e5;

  function rand(a, b) { return a + Math.random() * (b - a); }

  // Estate tokens, hardcoded. Dark: --gold-bright / --patina-bright, full glow.
  // Light: --gold (deep) / --patina-deep, softened — pale gold is unreadable on
  // the light hero background, so the culture inks in instead.
  function palette() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { warm: [227, 199, 126], cool: [107, 179, 157], glow: 1, alpha: 1 }
      : { warm: [138, 113, 58], cool: [47, 90, 78], glow: 0, alpha: 0.9 };
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2;
    R = Math.min(W, H) * 0.6;
    MAX = Math.max(52, Math.min(130, Math.round((W * H) / 4000)));
    LINK = Math.min(W, H) * 0.2;
    return true;
  }

  function spawn(x, y, vx, vy) {
    cells.push({
      x: x, y: y, vx: vx, vy: vy,
      r: rand(1.1, 3.1),
      cool: Math.random() < 0.26,   // a minority patina — the evidence tone
      age: 0,
      life: rand(560, 1500),        // frames of life before it fades and is refed
      fade: rand(45, 95),           // fade-in / fade-out window
      born: 0,                      // brief division flash
      phase: rand(0, Math.PI * 2)
    });
  }

  function seedFromCore() {
    var a = rand(0, Math.PI * 2), d = rand(0, R * 0.14), s = rand(0.04, 0.13);
    spawn(cx + Math.cos(a) * d, cy + Math.sin(a) * d, Math.cos(a) * s, Math.sin(a) * s);
    cells[cells.length - 1].born = 12;
  }

  // Seed anywhere within the membrane, centre-weighted, so the culture fills its
  // bounds — a nebula, not a knot at the core.
  function seedSpread() {
    var a = rand(0, Math.PI * 2), d = R * Math.pow(Math.random(), 0.6);
    spawn(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rand(-0.05, 0.05), rand(-0.05, 0.05));
  }

  function bud(parent) {
    var a = rand(0, Math.PI * 2);
    spawn(parent.x + Math.cos(a) * 4, parent.y + Math.sin(a) * 4,
          Math.cos(a) * rand(0.02, 0.08), Math.sin(a) * rand(0.02, 0.08));
    cells[cells.length - 1].born = 12;
  }

  function fadeAlpha(c) {
    if (c.age < c.fade) return c.age / c.fade;
    if (c.age > c.life - c.fade) return Math.max(0, (c.life - c.age) / c.fade);
    return 1;
  }

  function step() {
    t++;
    // Growth toward MAX: the culture rises. New cells seed from the core and
    // bud from existing cells; at capacity, births simply refill the dead.
    if (cells.length < MAX) {
      var r = Math.random();
      if (r < 0.55) seedSpread();
      else if (r < 0.78) seedFromCore();
      if (cells.length && Math.random() < 0.4) bud(cells[(Math.random() * cells.length) | 0]);
    }

    for (var i = cells.length - 1; i >= 0; i--) {
      var c = cells[i];
      c.age++;
      if (c.born > 0) c.born--;

      c.vx += rand(-0.006, 0.006);
      c.vy += rand(-0.006, 0.006);

      var dx = c.x - cx, dy = c.y - cy;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist > R) {                          // soft membrane: spring inward
        var pull = (dist - R) * 0.0018;
        c.vx -= (dx / dist) * pull;
        c.vy -= (dy / dist) * pull;
      }

      // Feed on the cursor: nearby cells energise and brighten.
      var mdx = c.x - mx, mdy = c.y - my;
      if (mdx * mdx + mdy * mdy < 8000) {
        c.vx += mdx * 0.00035;
        c.vy += mdy * 0.00035;
      }

      c.vx *= 0.975; c.vy *= 0.975;
      c.x += c.vx; c.y += c.vy;

      if (c.age > c.life) cells.splice(i, 1);
    }
  }

  function draw() {
    var p = palette();
    ctx.clearRect(0, 0, W, H);

    // Warm bloom behind the core: depth, and the membrane implied by a falloff
    // rather than a hard ring.
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.18);
    g.addColorStop(0, "rgba(" + p.warm.join(",") + "," + (0.11 * (p.glow || 0.4)) + ")");
    g.addColorStop(0.55, "rgba(" + p.warm.join(",") + "," + (0.03 * (p.glow || 0.4)) + ")");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Links: the accreting network. O(n^2) is fine at this population.
    for (var i = 0; i < cells.length; i++) {
      var a = cells[i], fa = fadeAlpha(a);
      for (var j = i + 1; j < cells.length; j++) {
        var b = cells[j];
        var dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          var d = Math.sqrt(d2);
          var al = (1 - d / LINK) * 0.15 * p.alpha * fa * fadeAlpha(b);
          if (al > 0.004) {
            ctx.strokeStyle = "rgba(" + p.warm.join(",") + "," + al + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // Cells.
    for (var k = 0; k < cells.length; k++) {
      var c = cells[k];
      var col = c.cool ? p.cool : p.warm;
      var fa2 = fadeAlpha(c) * p.alpha;
      var pulse = 0.78 + 0.22 * Math.sin(c.phase + c.age * 0.035);
      var rr = c.r * (1 + c.born * 0.05);
      var al2 = fa2 * (0.6 + 0.4 * pulse);
      if (p.glow) {
        var gg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, rr * 4.5);
        gg.addColorStop(0, "rgba(" + col.join(",") + "," + (al2 * 0.45) + ")");
        gg.addColorStop(1, "rgba(" + col.join(",") + ",0)");
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(c.x, c.y, rr * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(" + col.join(",") + "," + al2 + ")";
      ctx.beginPath();
      ctx.arc(c.x, c.y, rr, 0, Math.PI * 2);
      ctx.fill();
    }

    // The protected core: bright, stable, inviolate — it breathes, never drifts.
    var breathe = 0.82 + 0.18 * Math.sin(t * 0.03);
    var coreR = Math.max(2.4, Math.min(W, H) * 0.007);
    var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 9 * breathe);
    cg.addColorStop(0, "rgba(" + p.warm.join(",") + "," + (0.5 * breathe) + ")");
    cg.addColorStop(0.5, "rgba(" + p.warm.join(",") + "," + (0.12 * breathe) + ")");
    cg.addColorStop(1, "rgba(" + p.warm.join(",") + ",0)");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 9 * breathe, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(" + p.warm.join(",") + "," + (0.95 * (p.alpha)) + ")";
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- lifecycle ------------------------------------------------------------

  var running = false, raf = 0, onScreen = true;

  function loop() {
    if (!running) return;
    step();
    draw();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || !onScreen || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  function reducedMotion() {
    return (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
      document.documentElement.classList.contains("motion-off") ||
      document.body.classList.contains("motion-off");
  }

  function init() {
    if (!resize()) { requestAnimationFrame(init); return; }  // wait for layout

    if (reducedMotion()) {
      for (var i = 0; i < 520; i++) step();   // fast-forward to a mature culture
      draw();                                  // one still frame, no loop
      return;
    }

    // Land on a substantial culture, then let it densify and live.
    var initial = Math.round(MAX * 0.6);
    for (var s = 0; s < initial; s++) seedSpread();

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) start(); else stop();
      }, { threshold: 0 });
      io.observe(canvas);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (resize() && reducedMotion()) draw(); }, 150);
  }, { passive: true });

  window.addEventListener("mousemove", function (e) {
    var rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
