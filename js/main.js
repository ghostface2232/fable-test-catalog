/* MERIDIAN — a travel catalog
   Headline fitting, snap-entry reveals, section indicator. */

(function () {
  "use strict";

  const panels = Array.from(document.querySelectorAll(".panel"));
  const roll = document.getElementById("indicatorRoll");
  const place = document.getElementById("indicatorPlace");
  const a11y = document.getElementById("indicatorA11y");

  // Accent tone per section, mirrored onto the indicator chrome.
  const ACCENTS = {
    kyoto: "#c9798f",
    marrakech: "#d0824a",
    reykjavik: "#7fb8bb",
    cusco: "#c8a04e",
    positano: "#8ba3dd",
    lofoten: "#7dbcae",
  };

  /* ----------------------------------------------------------
     1. Split headlines into letters for the staggered rise
     ---------------------------------------------------------- */
  const headlines = Array.from(document.querySelectorAll(".panel__city"));

  headlines.forEach((h) => {
    const text = h.textContent.trim();
    h.setAttribute("aria-label", text);
    h.textContent = "";
    Array.from(text).forEach((char, i) => {
      const outer = document.createElement("span");
      outer.className = "ch";
      outer.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.className = "ch__in";
      inner.style.setProperty("--ci", i);
      inner.textContent = char;
      outer.appendChild(inner);
      h.appendChild(outer);
    });
  });

  /* ----------------------------------------------------------
     2. Fit each headline to 80% of the viewport width
     ---------------------------------------------------------- */
  const PROBE_SIZE = 100; // px — measure at a known size, then scale

  function fitHeadlines() {
    const target = window.innerWidth * 0.8;
    headlines.forEach((h) => {
      h.style.fontSize = PROBE_SIZE + "px";
      const measured = h.scrollWidth;
      if (measured > 0) {
        h.style.fontSize = (PROBE_SIZE * target) / measured + "px";
      }
    });
  }

  let resizeRaf = null;
  window.addEventListener("resize", () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(fitHeadlines);
  });

  // Fit now, and refit once the display face has actually loaded,
  // since Fraunces metrics differ from the fallback serif.
  fitHeadlines();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitHeadlines);
  }
  window.addEventListener("load", fitHeadlines);

  /* ----------------------------------------------------------
     3. Snap-entry detection → reveals + indicator state
     ---------------------------------------------------------- */
  let activeIndex = -1;

  function setIndicator(index) {
    const panel = panels[index];

    // Rolling counter
    roll.style.transform = "translateY(" + -index * 1.4 + "em)";

    // Progress rule + accent color
    document.documentElement.style.setProperty(
      "--progress",
      String((index + 1) / panels.length)
    );
    document.documentElement.style.setProperty(
      "--section-accent",
      ACCENTS[panel.id] || "#c96f4a"
    );

    // Place label with a soft swap
    const label = panel.dataset.place || "";
    if (place.textContent !== label) {
      place.classList.add("is-swapping");
      setTimeout(() => {
        place.textContent = label;
        place.classList.remove("is-swapping");
      }, 200);
    }

    a11y.textContent = "Section " + (index + 1) + " of " + panels.length;
  }

  function activate(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    panels.forEach((p, i) => {
      p.classList.toggle("is-active", i === index);
    });
    setIndicator(index);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activate(panels.indexOf(entry.target));
        }
      });
    },
    { threshold: 0.55 }
  );

  panels.forEach((p) => observer.observe(p));

  // Ensure the first panel animates in even before any scroll occurs.
  requestAnimationFrame(() => {
    if (activeIndex === -1) activate(0);
  });
})();
