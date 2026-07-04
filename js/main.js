/* MERIDIAN — a travel catalog
   Photography loading with graceful fallback, headline fitting,
   snap-entry reveals, lerped scroll/pointer parallax, variable-font
   proximity effect, rail navigation, section indicator. */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     Imagery — candidates are tried in order; if every candidate
     fails the section keeps its gradient plate. To art-direct a
     section, edit its list here.

     Primary: bespoke images generated with Higgsfield (Soul v2),
     art-directed to the catalog's dark tonal palette. `src` feeds
     the plate, `backdrop` (lightweight webp) feeds the blurred
     full-bleed layer. Fallbacks: Unsplash CDN hotlinks, then the
     tonal gradient.
     ---------------------------------------------------------- */
  var HF = "https://d8j0ntlcm91z4.cloudfront.net/user_3D4FWlRHKNDsjbcrqPS1P5WL27Z/";
  var IMG_PARAMS = "auto=format&fit=crop&q=80&w=1600";

  function hf(file) {
    return {
      src: HF + file + ".png",
      backdrop: HF + file + "_min.webp",
      credit: "Imagery — Higgsfield AI",
    };
  }
  function un(idOrUrl) {
    var url = idOrUrl.indexOf("http") === 0
      ? idOrUrl
      : "https://images.unsplash.com/" + idOrUrl + "?" + IMG_PARAMS;
    return { src: url, backdrop: url, credit: "Photograph — Unsplash" };
  }

  var PHOTOS = {
    kyoto: [
      hf("hf_20260704_013325_60ce4bf9-3cff-4345-ad19-47f1e1761fc3"),
      un("photo-1545569341-9eb8b30979d9"),
      un("photo-1493976040374-85c8e12f0c0e"),
    ],
    manarola: [
      hf("hf_20260704_013327_be51dc35-a4a9-4dc8-857e-077794229345"),
      un("photo-1516483638261-f4dbaf036963"),
    ],
    merzouga: [
      hf("hf_20260704_013329_1dc03b37-5159-4343-a662-6adcc0c3d953"),
      un("https://unsplash.com/photos/PV1Y6JdSNzo/download?force=true&w=1600"),
      un("photo-1489749798305-4fea3ae63d43"),
    ],
    lofoten: [
      hf("hf_20260704_013332_0b45e0de-846d-4e7a-9168-1cd5e74597fd"),
      un("photo-1531366936337-7c912a4589a7"),
    ],
    cusco: [
      hf("hf_20260704_013334_5af3e8d7-a87a-4bf3-9e19-6ce993db6805"),
      un("photo-1526392060635-9d6019884377"),
    ],
    paris: [
      hf("hf_20260704_013337_3ecaeb4a-4efd-4f63-8c3b-7fd5b2e30c3c"),
      un("photo-1502602898657-3e91760cbb34"),
    ],
  };

  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var roll = document.getElementById("indicatorRoll");
  var place = document.getElementById("indicatorPlace");
  var a11y = document.getElementById("indicatorA11y");
  var rail = document.getElementById("rail");
  var cue = document.querySelector(".scroll-cue");
  var root = document.documentElement;

  function loadPhoto(panel) {
    if (panel.dataset.loading) return;
    panel.dataset.loading = "1";
    var candidates = (PHOTOS[panel.id] || []).slice();
    var photo = panel.querySelector(".panel__photo");
    var backdrop = panel.querySelector(".panel__backdrop-img");
    var credit = panel.querySelector(".panel__credit");
    if (!photo || !candidates.length) return;

    (function tryNext() {
      if (!candidates.length) {
        panel.classList.add("no-photo");
        return;
      }
      var c = candidates.shift();
      var probe = new Image();
      probe.onload = function () {
        photo.src = c.src;
        backdrop.src = c.backdrop || c.src;
        if (credit && c.credit) credit.textContent = c.credit;
        panel.classList.add("has-photo");
      };
      probe.onerror = tryNext;
      probe.src = c.src;
    })();
  }

  /* Load the first section immediately; the rest lazily as the
     reader approaches (the raw plates are heavy). */
  loadPhoto(panels[0]);
  var photoObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadPhoto(entry.target);
          photoObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "200% 0px" }
  );
  panels.slice(1).forEach(function (p) {
    photoObserver.observe(p);
  });

  /* ----------------------------------------------------------
     Split headlines into letters for the staggered rise
     ---------------------------------------------------------- */
  var headlines = Array.prototype.slice.call(document.querySelectorAll(".panel__city"));

  headlines.forEach(function (h) {
    var text = h.textContent.trim();
    h.setAttribute("aria-label", text);
    h.textContent = "";
    Array.prototype.forEach.call(text, function (char, i) {
      var outer = document.createElement("span");
      outer.className = "ch";
      outer.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.className = "ch__in";
      inner.style.setProperty("--ci", i);
      inner.textContent = char;
      outer.appendChild(inner);
      h.appendChild(outer);
    });
  });

  /* ----------------------------------------------------------
     Fit each headline to 80% of the viewport width
     ---------------------------------------------------------- */
  var PROBE_SIZE = 100; // px — measure at a known size, then scale

  function fitHeadlines() {
    var target = window.innerWidth * 0.8;
    headlines.forEach(function (h) {
      h.style.fontSize = PROBE_SIZE + "px";
      var measured = h.scrollWidth;
      if (measured > 0) {
        h.style.fontSize = (PROBE_SIZE * target) / measured + "px";
      }
    });
  }

  var resizeRaf = null;
  window.addEventListener("resize", function () {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(fitHeadlines);
  });

  fitHeadlines();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitHeadlines);
  }
  window.addEventListener("load", fitHeadlines);

  /* ----------------------------------------------------------
     Rail navigation
     ---------------------------------------------------------- */
  var railItems = panels.map(function (panel, i) {
    var btn = document.createElement("button");
    btn.className = "rail__item";
    btn.type = "button";
    btn.setAttribute("aria-label", panel.dataset.place);
    btn.innerHTML =
      '<span class="rail__label">' +
      ("0" + (i + 1)).slice(-2) + " — " + panel.dataset.place.split(",")[0] +
      '</span><span class="rail__tick" aria-hidden="true"></span>';
    btn.addEventListener("click", function () {
      panel.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
    });
    rail.appendChild(btn);
    return btn;
  });

  /* Keyboard navigation */
  window.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "PageDown" && e.key !== "PageUp") return;
    if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
    e.preventDefault();
    var dir = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : -1;
    var next = Math.min(panels.length - 1, Math.max(0, activeIndex + dir));
    panels[next].scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
  });

  /* ----------------------------------------------------------
     Snap-entry detection → reveals + indicator + rail state
     ---------------------------------------------------------- */
  var activeIndex = -1;

  function setIndicator(index) {
    var panel = panels[index];

    roll.style.transform = "translateY(" + -index * 1.4 + "em)";
    root.style.setProperty("--progress", String((index + 1) / panels.length));
    root.style.setProperty("--section-accent", panel.dataset.accent || "#c9798f");

    var label = panel.dataset.place || "";
    if (place.textContent !== label) {
      place.classList.add("is-swapping");
      setTimeout(function () {
        place.textContent = label;
        place.classList.remove("is-swapping");
      }, 220);
    }

    a11y.textContent = "Section " + (index + 1) + " of " + panels.length;

    railItems.forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === index);
    });
  }

  function activate(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    panels.forEach(function (p, i) {
      p.classList.toggle("is-active", i === index);
    });
    setIndicator(index);
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activate(panels.indexOf(entry.target));
        }
      });
    },
    { threshold: 0.55 }
  );

  panels.forEach(function (p) {
    observer.observe(p);
  });

  requestAnimationFrame(function () {
    if (activeIndex === -1) activate(0);
  });

  /* Retire the scroll cue once the reader moves */
  var cueRetired = false;
  window.addEventListener(
    "scroll",
    function () {
      if (cueRetired || window.scrollY < 40) return;
      cueRetired = true;
      if (cue) cue.classList.add("is-retired");
    },
    { passive: true }
  );

  if (REDUCED) return; // everything below is decorative motion

  /* ----------------------------------------------------------
     Motion engine — one rAF loop, everything lerped.

     Two inputs:
       pointer  (nx, ny in -0.5..0.5, eased toward the cursor)
       scroll   (per-panel progress: 0 centered, ±1 a viewport away)

     Layer depths (px of drift at full input) — each layer moves at
     its own rate, which is what produces the parallax depth.
     ---------------------------------------------------------- */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  var pointer = { tx: 0, ty: 0, x: 0, y: 0 };
  var lastScrollY = window.scrollY;
  var velocity = 0; // lerped px/frame, drives the headline shear
  window.addEventListener(
    "mousemove",
    function (e) {
      pointer.tx = e.clientX / window.innerWidth - 0.5;
      pointer.ty = e.clientY / window.innerHeight - 0.5;
    },
    { passive: true }
  );

  var FINE_POINTER = window.matchMedia("(pointer: fine)").matches;

  var layers = panels.map(function (panel) {
    return {
      panel: panel,
      backdrop: panel.querySelector(".panel__backdrop-img"),
      plate: panel.querySelector(".panel__plate"),
      photo: panel.querySelector(".panel__photo"),
      ghost: panel.querySelector(".panel__ghost"),
      content: panel.querySelector(".panel__content"),
      city: panel.querySelector(".panel__city"),
      letters: Array.prototype.slice.call(panel.querySelectorAll(".ch__in")),
      weights: null, // lazy — filled on first proximity pass
      sp: 0, // lerped scroll progress
    };
  });

  var vh = window.innerHeight;
  window.addEventListener("resize", function () {
    vh = window.innerHeight;
  });

  var BASE_WGHT = 340;
  var PEAK_WGHT = 620;

  function frame() {
    pointer.x = lerp(pointer.x, FINE_POINTER ? pointer.tx : 0, 0.055);
    pointer.y = lerp(pointer.y, FINE_POINTER ? pointer.ty : 0, 0.055);
    var px = pointer.x;
    var py = pointer.y;

    // scroll velocity → gentle shear on the headline (max ~1°)
    var sy = window.scrollY;
    var rawVel = Math.max(-80, Math.min(80, sy - lastScrollY));
    lastScrollY = sy;
    velocity = lerp(velocity, rawVel, 0.09);
    var shear = velocity * 0.013;

    layers.forEach(function (L, idx) {
      var rect = L.panel.getBoundingClientRect();
      // skip panels far off-screen
      if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) return;

      var target = rect.top / vh; // 0 when snapped, ±1 a viewport away
      L.sp = lerp(L.sp, target, 0.12);
      var sp = L.sp;

      if (L.backdrop) {
        L.backdrop.style.transform =
          "scale(" + (1.06 + Math.abs(sp) * 0.05).toFixed(4) + ") translate3d(" +
          px * -14 + "px," + (py * -10 + sp * -0.04 * vh) + "px,0)";
      }
      if (L.plate) {
        L.plate.style.transform =
          "translate3d(" + px * 20 + "px," + (py * 14 + sp * 0.06 * vh) + "px,0)";
      }
      if (L.photo) {
        // inner counter-drift gives the plate a window-like depth,
        // and the image swells inside its clip while in flight,
        // settling back to rest as the section snaps
        L.photo.style.translate = px * -16 + "px " + (py * -12 + sp * -0.05 * vh) + "px";
        L.photo.style.scale = (1 + Math.min(0.14, Math.abs(sp) * 0.16)).toFixed(4);
      }
      if (L.ghost) {
        L.ghost.style.translate = px * 42 + "px " + (py * 30 + sp * 0.16 * vh) + "px";
      }
      if (L.content) {
        L.content.style.transform =
          "translate3d(" + px * -10 + "px," + (py * -7 + sp * -0.09 * vh) + "px,0)";
      }
      if (L.city) {
        L.city.style.transform = "skewY(" + shear.toFixed(3) + "deg)";
      }

      /* Variable-weight proximity — letters swell toward the cursor */
      if (FINE_POINTER && L.city && L.letters.length) {
        if (!L.weights) {
          L.weights = L.letters.map(function () {
            return BASE_WGHT;
          });
        }
        var active = idx === activeIndex;
        var mx = pointer.tx * window.innerWidth + window.innerWidth / 2;
        var my = pointer.ty * vh + vh / 2;
        var cityRect = L.city.getBoundingClientRect();
        var near =
          active &&
          my > cityRect.top - vh * 0.12 &&
          my < cityRect.bottom + vh * 0.12;

        L.letters.forEach(function (span, i) {
          var targetW = BASE_WGHT;
          if (near) {
            var r = span.getBoundingClientRect();
            var cx = r.left + r.width / 2;
            var d = Math.abs(mx - cx);
            var radius = Math.max(200, cityRect.width * 0.24);
            if (d < radius) {
              var t = 1 - d / radius;
              t = t * t * (3 - 2 * t); // smoothstep falloff
              targetW = BASE_WGHT + (PEAK_WGHT - BASE_WGHT) * t;
            }
          }
          var w = lerp(L.weights[i], targetW, 0.14);
          if (Math.abs(w - L.weights[i]) > 0.5) {
            L.weights[i] = w;
            span.style.fontVariationSettings = '"opsz" 144, "wght" ' + w.toFixed(0);
          }
        });
      }
    });

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
