/* MERIDIAN — itinerary pages
   Photography loading with graceful fallback, headline fitting,
   entry + scroll reveals, reading progress, section rail,
   pointer/scroll parallax on the hero. */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CITY = document.body.dataset.city || "";

  /* ----------------------------------------------------------
     Imagery — candidates are tried in order; if every candidate
     fails, the slot keeps its tonal gradient. Keys are
     "<city>:<slot>"; the hero slot reuses the catalog's plates,
     the day slots are bespoke Higgsfield (Soul v2) images
     art-directed to the same dark palette.
     ---------------------------------------------------------- */
  var HF = "https://d8j0ntlcm91z4.cloudfront.net/user_3D4FWlRHKNDsjbcrqPS1P5WL27Z/";
  var IMG_PARAMS = "auto=format&fit=crop&q=80&w=1600";

  function hf(file) {
    return { src: HF + file + ".png", credit: "Imagery — Higgsfield AI" };
  }
  function un(id) {
    return {
      src: "https://images.unsplash.com/" + id + "?" + IMG_PARAMS,
      credit: "Photograph — Unsplash",
    };
  }

  var PHOTOS = {
    /* heroes — same plates as the catalog */
    "kyoto:hero": [
      hf("hf_20260704_013325_60ce4bf9-3cff-4345-ad19-47f1e1761fc3"),
      un("photo-1545569341-9eb8b30979d9"),
    ],
    "manarola:hero": [
      hf("hf_20260704_013327_be51dc35-a4a9-4dc8-857e-077794229345"),
      un("photo-1516483638261-f4dbaf036963"),
    ],
    "merzouga:hero": [
      hf("hf_20260704_013329_1dc03b37-5159-4343-a662-6adcc0c3d953"),
      un("photo-1489749798305-4fea3ae63d43"),
    ],
    "lofoten:hero": [
      hf("hf_20260704_013332_0b45e0de-846d-4e7a-9168-1cd5e74597fd"),
      un("photo-1531366936337-7c912a4589a7"),
    ],
    "cusco:hero": [
      hf("hf_20260704_013334_5af3e8d7-a87a-4bf3-9e19-6ce993db6805"),
      un("photo-1526392060635-9d6019884377"),
    ],
    "paris:hero": [
      hf("hf_20260704_013337_3ecaeb4a-4efd-4f63-8c3b-7fd5b2e30c3c"),
      un("photo-1502602898657-3e91760cbb34"),
    ],

    /* day plates — bespoke, with Unsplash fallbacks */
    "kyoto:torii": [
      hf("hf_20260704_035507_ad389473-9fc5-4bf6-8661-83f484d98919"),
      un("photo-1478436127897-769e1b3f0f36"),
    ],
    "kyoto:garden": [
      hf("hf_20260704_035509_53cb215b-cd85-43be-b20a-1380fcf3b21c"),
      un("photo-1503640538573-148065ba4904"),
    ],
    "manarola:path": [
      hf("hf_20260704_035511_0d72d6d6-176a-499a-84ed-cc489e3d4af0"),
      un("photo-1499678329028-101435549a4e"),
    ],
    "manarola:harbor": [
      hf("hf_20260704_035514_6ee2cdfe-9af5-4105-ae22-fe0442e08e16"),
      un("photo-1538332576228-eb5b4c4de6f5"),
    ],
    "merzouga:caravan": [
      hf("hf_20260704_035517_d7bff022-db20-4207-bc2c-0e60d68e0a88"),
      un("photo-1509316785289-025f5b846b35"),
    ],
    "merzouga:camp": [
      hf("hf_20260704_035519_99245091-f5c0-4fe2-a27c-48ecbc1c3ea8"),
      un("photo-1518623489648-a173ef7824f3"),
    ],
    "lofoten:rorbu": [
      hf("hf_20260704_035521_d4937412-8170-49ed-b668-bd7fa85d9881"),
      un("photo-1520769945061-0a448c463865"),
    ],
    "lofoten:aurora": [
      hf("hf_20260704_035524_50d7a6bf-baf4-455c-ad90-6fa067b0076d"),
      un("photo-1483347756197-71ef80e95f73"),
    ],
    "cusco:citadel": [
      hf("hf_20260704_061817_e70e617e-df0b-4c3b-8597-795e8179a923"),
      hf("hf_20260704_062101_e3deb132-b33d-4e91-8bb8-f499615db166"),
      un("photo-1587595431973-160d0d94add1"),
    ],
    "cusco:alley": [
      hf("hf_20260704_035530_ec3eaf21-5775-48f9-ac8c-4b91035e9bdd"),
      un("photo-1531968455001-5c5272a41129"),
    ],
    "paris:seine": [
      hf("hf_20260704_061821_e9e763c7-4b33-4886-a13c-c65f83725f44"),
      hf("hf_20260704_062103_41984255-4da1-4326-9aff-d0006a701bdd"),
      un("photo-1499856871958-5b9627545d1a"),
    ],
    "paris:rooftops": [
      hf("hf_20260704_035532_35fca2e6-88df-4b1e-9311-81b56ed9eafb"),
      un("photo-1550340499-a6c60fc8287c"),
    ],
  };

  function loadPhoto(holder) {
    if (holder.dataset.loading) return;
    holder.dataset.loading = "1";
    var key = CITY + ":" + holder.dataset.photo;
    var candidates = (PHOTOS[key] || []).slice();
    var img = holder.querySelector("img");
    var credit = holder.querySelector("[data-credit]");
    if (!img || !candidates.length) return;

    (function tryNext() {
      if (!candidates.length) return;
      var c = candidates.shift();
      var probe = new Image();
      probe.onload = function () {
        img.src = c.src;
        if (credit && c.credit) credit.textContent = c.credit;
        holder.classList.add("has-photo");
      };
      probe.onerror = tryNext;
      probe.src = c.src;
    })();
  }

  var hero = document.querySelector(".hero");
  var holders = Array.prototype.slice.call(document.querySelectorAll("[data-photo]"));

  /* Hero immediately; day plates lazily as the reader approaches */
  holders.forEach(function (h) {
    if (h.dataset.photo === "hero") loadPhoto(h);
  });
  var photoObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadPhoto(entry.target);
          photoObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "150% 0px" }
  );
  holders.forEach(function (h) {
    if (h.dataset.photo !== "hero") photoObserver.observe(h);
  });

  /* ----------------------------------------------------------
     Headline — letter split + fit to 80% viewport width
     ---------------------------------------------------------- */
  var headline = document.querySelector(".hero__city");
  if (headline) {
    var text = headline.textContent.trim();
    headline.setAttribute("aria-label", text);
    headline.textContent = "";
    Array.prototype.forEach.call(text, function (char, i) {
      var outer = document.createElement("span");
      outer.className = "ch";
      outer.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.className = "ch__in";
      inner.style.setProperty("--ci", i);
      inner.textContent = char;
      outer.appendChild(inner);
      headline.appendChild(outer);
    });
  }

  var PROBE_SIZE = 100;
  function fitHeadline() {
    if (!headline) return;
    var target = window.innerWidth * 0.8;
    headline.style.fontSize = PROBE_SIZE + "px";
    var measured = headline.scrollWidth;
    if (measured > 0) {
      headline.style.fontSize = (PROBE_SIZE * target) / measured + "px";
    }
  }
  var resizeRaf = null;
  window.addEventListener("resize", function () {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(fitHeadline);
  });
  fitHeadline();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitHeadline);
  }
  window.addEventListener("load", fitHeadline);

  /* Hero entrance */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (hero) hero.classList.add("is-active");
    });
  });

  /* ----------------------------------------------------------
     Scroll reveals — sections, days, plates
     ---------------------------------------------------------- */
  var revealables = Array.prototype.slice.call(
    document.querySelectorAll(".sreveal, .day__figure")
  );
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  revealables.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ----------------------------------------------------------
     Rail — one tick per major section
     ---------------------------------------------------------- */
  var rail = document.getElementById("rail");
  var stops = Array.prototype.slice.call(document.querySelectorAll("[data-rail]"));
  var railItems = [];

  if (rail && stops.length) {
    railItems = stops.map(function (stop) {
      var btn = document.createElement("button");
      btn.className = "rail__item";
      btn.type = "button";
      btn.setAttribute("aria-label", stop.dataset.rail);
      btn.innerHTML =
        '<span class="rail__label">' + stop.dataset.rail +
        '</span><span class="rail__tick" aria-hidden="true"></span>';
      btn.addEventListener("click", function () {
        stop.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
      });
      rail.appendChild(btn);
      return btn;
    });

    var railObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var idx = stops.indexOf(entry.target);
          railItems.forEach(function (btn, i) {
            btn.classList.toggle("is-active", i === idx);
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    stops.forEach(function (s) {
      railObserver.observe(s);
    });
  }

  /* ----------------------------------------------------------
     Reading progress + cue retirement
     ---------------------------------------------------------- */
  var root = document.documentElement;
  var cue = document.querySelector(".hero__cue");
  var cueRetired = false;

  function onScroll() {
    var max = root.scrollHeight - window.innerHeight;
    root.style.setProperty(
      "--progress",
      String(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    );
    if (!cueRetired && window.scrollY > 40) {
      cueRetired = true;
      if (cue) cue.classList.add("is-retired");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (REDUCED) return; // everything below is decorative motion

  /* ----------------------------------------------------------
     Hero parallax — pointer drift + scroll recession
     ---------------------------------------------------------- */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  var FINE_POINTER = window.matchMedia("(pointer: fine)").matches;
  var pointer = { tx: 0, ty: 0, x: 0, y: 0 };
  window.addEventListener(
    "mousemove",
    function (e) {
      pointer.tx = e.clientX / window.innerWidth - 0.5;
      pointer.ty = e.clientY / window.innerHeight - 0.5;
    },
    { passive: true }
  );

  var backdrop = document.querySelector(".hero__backdrop-img");
  var ghost = document.querySelector(".hero__ghost");
  var heroContent = document.querySelector(".hero__content");
  var vh = window.innerHeight;
  window.addEventListener("resize", function () {
    vh = window.innerHeight;
  });

  function frame() {
    pointer.x = lerp(pointer.x, FINE_POINTER ? pointer.tx : 0, 0.055);
    pointer.y = lerp(pointer.y, FINE_POINTER ? pointer.ty : 0, 0.055);
    var px = pointer.x;
    var py = pointer.y;
    var sy = window.scrollY;

    if (sy < vh * 1.2) {
      var sp = sy / vh; // 0 at top → 1 a viewport down
      if (backdrop) {
        backdrop.style.transform =
          "scale(" + (1.06 + sp * 0.04).toFixed(4) + ") translate3d(" +
          px * -14 + "px," + (py * -10 + sp * 0.06 * vh) + "px,0)";
      }
      if (ghost) {
        ghost.style.translate = px * 42 + "px " + (py * 30 + sp * 0.22 * vh) + "px";
      }
      if (heroContent) {
        heroContent.style.transform =
          "translate3d(" + px * -10 + "px," + (py * -7 + sp * -0.12 * vh) + "px,0)";
        heroContent.style.opacity = String(Math.max(0, 1 - sp * 1.3));
      }
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
