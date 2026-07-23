/**
 * version-badges.js — the hand-typed version numbers read themselves.
 *
 * WHY THIS EXISTS. The versions and test counts on this site have gone stale
 * twice (anneal-memory sat at 0.3.3 while PyPI was at 0.9.6; Levain sat at
 * 0.2.0 against 0.3.13). Both times the fix was "remember to update it," and
 * both times remembering failed. An invariant beats discipline, so the numbers
 * that CAN read themselves now do.
 *
 * PROGRESSIVE ENHANCEMENT, DELIBERATELY. Every badge ships with the correct
 * value already in the HTML. This script only ever replaces it with a fresher
 * one. If PyPI is down, the fetch fails, or JS never runs, the reader sees the
 * hand-typed value — which was accurate the day it was committed. The failure
 * mode is "slightly old," never "blank" and never "undefined".
 *
 * WHAT IT CANNOT DO, STATED PLAINLY. Test counts (1,642 / 1,702) and the
 * integration count are not published in any machine-readable place — they come
 * from RUNNING the suites. This script cannot refresh them and does not pretend
 * to. What it does instead: when a package's live version differs from the one
 * baked into this page, it warns in the console, because a version bump is the
 * best available signal that the counts next to it have also moved. Drift you
 * can see beats drift you cannot.
 *
 * PyPI's JSON API sends `access-control-allow-origin: *` (verified against the
 * live endpoint), so this needs no proxy and no build step.
 *
 * PRIVACY. Every request to PyPI hands them the reader's IP address, and a
 * release lands every few weeks at most, so asking on each pageview would be
 * both useless and rude. The answer is cached in localStorage for 12 hours and
 * sent with `no-referrer`, which drops the third-party contact to roughly once
 * per reader per day and stops PyPI's logs learning which page they were on.
 * A blocked or full localStorage degrades to the uncached path, not to failure.
 */
(function () {
  "use strict";

  var badges = document.querySelectorAll("[data-pkg]");
  if (!badges.length) return;

  // One request per distinct package, no matter how many badges reference it.
  var packages = {};
  badges.forEach(function (el) {
    var name = el.getAttribute("data-pkg");
    if (!name) return;
    (packages[name] = packages[name] || []).push(el);
  });

  // A release lands every few weeks at most, so a visitor gains nothing from
  // asking PyPI on every pageview — and each ask hands PyPI that visitor's IP
  // and referer. Cache the answer and the site touches a third party roughly
  // once per reader per day instead of once per page.
  var TTL_MS = 12 * 60 * 60 * 1000;

  function cached(name) {
    try {
      var raw = localStorage.getItem("pkgver:" + name);
      if (!raw) return null;
      var hit = JSON.parse(raw);
      if (!hit || typeof hit.v !== "string") return null;
      if (Date.now() - hit.t > TTL_MS) return null;
      return hit.v;
    } catch (e) {
      return null; // private mode, quota, corrupt entry — treat as a miss
    }
  }

  function remember(name, version) {
    try {
      localStorage.setItem(
        "pkgver:" + name,
        JSON.stringify({ v: version, t: Date.now() })
      );
    } catch (e) {
      /* caching is an optimisation, never a requirement */
    }
  }

  function paint(name, live) {
    var drifted = null;
    packages[name].forEach(function (el) {
      var baked = (el.textContent || "").replace(/^v/, "").trim();
      if (baked && baked !== live) drifted = baked;
      el.textContent = "v" + live;
      el.setAttribute("title", "Read from PyPI, cached for up to 12 hours.");
      el.setAttribute("data-live", "true");
    });

    // Once per package, not once per badge — a page can carry several.
    if (drifted) {
      console.warn(
        "[version-badges] " +
          name +
          " is " +
          live +
          " on PyPI but this page was written against " +
          drifted +
          ". Test counts and integration counts near this badge are " +
          "hand-typed and cannot self-update — check them."
      );
    }
  }

  Object.keys(packages).forEach(function (name) {
    var hit = cached(name);
    if (hit) {
      paint(name, hit);
      return;
    }

    fetch("https://pypi.org/pypi/" + encodeURIComponent(name) + "/json", {
      // No credentials, no cookies — a plain public read.
      credentials: "omit",
      referrerPolicy: "no-referrer",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("pypi " + res.status);
        return res.json();
      })
      .then(function (data) {
        var live = data && data.info && data.info.version;
        if (typeof live !== "string" || !/^[\w.+!-]{1,32}$/.test(live)) {
          throw new Error("unusable version in payload");
        }
        remember(name, live);
        paint(name, live);
      })
      .catch(function (err) {
        // Silent for the reader. The baked-in value stands.
        console.debug("[version-badges] " + name + " left as committed:", err.message);
      });
  });
})();
