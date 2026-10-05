/**
 * version-badges.js — the hand-typed version numbers read themselves.
 *
 * WHY THIS EXISTS. The versions and test counts on this site have gone stale
 * twice (anneal-memory sat at 0.3.3 while PyPI was at 0.9.6; Levain sat at
 * 0.2.0 against 0.3.13). Both times the fix was "remember to update it," and
 * both times remembering failed. An invariant beats discipline, so the numbers
 * that CAN read themselves now do.
 *
 * PROGRESSIVE ENHANCEMENT, DELIBERATELY. The badge ships EMPTY on purpose: a
 * hand-typed version is wrong the day the next release lands (an old number sat beside
 * a claim that needed the new release). This script fills it from PyPI. If PyPI is down, the
 * fetch fails, or JS never runs, the reader sees no version at all, which is
 * blank rather than wrong. A badge that does carry baked text still works: it
 * is replaced. The version the neighbouring receipts were last audited against
 * rides in a `data-audited` attribute (never rendered); when live PyPI differs
 * from it, the console drift warning fires.
 *
 * WHAT IT CANNOT DO, STATED PLAINLY. Test counts are not published in
 * any machine-readable place — they come from RUNNING the suites — so the page
 * prints none. The badge only covers the version number itself; the receipts
 * beside it (export counts, the audited claims) are hand-typed and do not
 * follow a release. The anneal pin is NOT among them: it is read from the same
 * PyPI payload's requires_dist, so it follows the badge with no edit.
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

  // The anneal pin: an empty [data-pin-of] span is filled from the badge
  // package's requires_dist entry for that dependency (no `extra ==` marker),
  // e.g. "anneal-memory<0.10,>=0.9.39" -> "(pinned \u22650.9.39,<0.10)". Blank on
  // any failure, like the badge.
  var pinEls = document.querySelectorAll("[data-pin-of]");

  function pinFor(requires, dep) {
    if (!Array.isArray(requires)) return null;
    for (var i = 0; i < requires.length; i++) {
      var r = String(requires[i]);
      if (r.indexOf(";") !== -1) continue; // extras / markers are not the pin
      if (r.toLowerCase().indexOf(dep.toLowerCase()) !== 0) continue;
      var spec = r.slice(dep.length).replace(/\s+/g, "");
      if (!/^[<>=!~][\w.,<>=!~*+-]{0,40}$/.test(spec)) return null;
      // PyPI lists clauses in arbitrary order; show lower bound first.
      var parts = spec.split(",").sort(function (a, b) {
        return (a.charAt(0) === ">" ? 0 : 1) - (b.charAt(0) === ">" ? 0 : 1);
      });
      return parts.join(",");
    }
    return null;
  }

  function paintPins(name, requires) {
    pinEls.forEach(function (el) {
      var dep = el.getAttribute("data-pin-of");
      var pin = dep && pinFor(requires, dep);
      if (!pin) return;
      el.textContent = "(pinned " + pin.replace(">=", "\u2265") + ")";
    });
  }

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
      var age = Date.now() - hit.t;
      if (pinEls.length && !Array.isArray(hit.r)) return null; // pre-pin entry
      if (typeof hit.t !== "number" || !(age >= 0 && age <= TTL_MS)) return null;
      return hit;
    } catch (e) {
      return null; // private mode, quota, corrupt entry — treat as a miss
    }
  }

  function remember(name, version, requires) {
    try {
      localStorage.setItem(
        "pkgver:" + name,
        JSON.stringify({ v: version, r: requires, t: Date.now() })
      );
    } catch (e) {
      /* caching is an optimisation, never a requirement */
    }
  }

  function paint(name, live) {
    var drifted = null;
    packages[name].forEach(function (el) {
      // The badge is empty by design; the version the neighbouring receipts
      // were audited against rides in data-audited, so drift is still visible.
      var baked = (el.getAttribute("data-audited") || "").trim();
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
          ". The receipts near this badge (export counts, audited claims) " +
          "are hand-typed and cannot self-update — check them."
      );
    }
  }

  Object.keys(packages).forEach(function (name) {
    var hit = cached(name);
    if (hit) {
      paint(name, hit.v);
      paintPins(name, hit.r);
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
        var req = (data.info.requires_dist || []).filter(function (r) {
          return typeof r === "string" && r.length < 200;
        });
        remember(name, live, req);
        paint(name, live);
        paintPins(name, req);
      })
      .catch(function (err) {
        // Silent for the reader. The badge ships empty on purpose, so a failed
        // fetch leaves it blank rather than showing a stale number.
        console.debug("[version-badges] " + name + " left blank:", err.message);
      });
  });
})();
