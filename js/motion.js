// The quail's motion. The topknot flicks once when the bird has arrived and again on a mouse
// hover or a tap; the bird blinks on its own every few seconds and on a hover or a tap; its eye
// follows the mouse, and on a touch screen glances at a tap and down when the page scrolls down,
// then rests. The layers it moves are in index.html, their shapes and rest in css/site.css.
//
// Nothing moves until every copy of the bird has loaded and a frame has been painted with it.
// Nothing moves at all when the visitor asks for reduced motion, hover, tap and scroll included.
// Only transform and opacity animate. Without JavaScript the bird is simply still: there is no
// arrival flick and no blinking, and nothing is hidden.
(() => {
  const bird = document.querySelector(".bird");
  if (!bird || !bird.animate || !window.matchMedia || !window.CSS || !CSS.supports("clip-path", "inset(1px)")) return;

  const $ = (s) => bird.querySelector(s);
  const img = $(".bird-img"), base = $(".plume-base"), plume = $(".plume");
  const pupil = $(".pupil"), lid = $(".lid-shut"), line = $(".lid-line");
  if (!img || !base || !plume || !pupil || !lid || !line) return;

  // The layers start hidden (index.html), so a page without its stylesheet shows one bird. They
  // come out only once the stylesheet is seen in force on them (placed over the bird, cut to
  // their shapes, out of sight) and only while motion is allowed.
  const layers = bird.querySelectorAll(".layer");
  const css = (el, p) => getComputedStyle(el).getPropertyValue(p);
  const styled = () =>
    css(bird, "position") === "relative" &&
    [...layers].every((el) => css(el, "position") === "absolute") &&
    css(plume, "clip-path") !== "none" && css(base, "opacity") === "0" && css(line, "opacity") === "0";
  const reveal = (on) => layers.forEach((el) => { el.hidden = !on; });

  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let live = false; // the bird has loaded and been painted
  let away = false; // the bird is off screen, or the page is hidden
  const may = () => live && !away && !still.matches;
  const running = (a) => !!a && a.playState === "running";

  // The topknot: forward 9 degrees, back 5, forward 2, still, in 700ms, turning on the stem's
  // base. For those 700ms the bird shows as its two cut layers.
  const SWING = "cubic-bezier(0.45, 0, 0.55, 1)";
  const KNOT = [
    { opacity: 1, transform: "rotate(0deg)", easing: "cubic-bezier(0.25, 0.7, 0.4, 1)" },
    { opacity: 1, transform: "rotate(-9deg)", offset: 0.15, easing: SWING },
    { opacity: 1, transform: "rotate(5deg)", offset: 0.45, easing: SWING },
    { opacity: 1, transform: "rotate(-2deg)", offset: 0.74, easing: "cubic-bezier(0.45, 0, 0.4, 1)" },
    { opacity: 1, transform: "rotate(0deg)" },
  ];
  let knot = null;
  function flick() {
    if (!may() || running(knot)) return;
    img.animate({ opacity: [0, 0] }, 700);
    base.animate({ opacity: [1, 1] }, 700);
    knot = plume.animate(KNOT, 700);
  }

  // One blink, 200ms: the lid drops in 60, stays shut 70, lifts in 70; the closed-eye dash
  // shows while it is shut.
  const UP = "translateY(-128px)";
  const LID = [
    { transform: UP, easing: "cubic-bezier(0.5, 0, 1, 1)" },
    { transform: "none", offset: 60 / 200 },
    { transform: "none", offset: 130 / 200, easing: "cubic-bezier(0, 0, 0.5, 1)" },
    { transform: UP },
  ];
  const LINE = [
    { opacity: 0, easing: "step-end" },
    { opacity: 1, offset: 59 / 200, easing: "step-end" },
    { opacity: 0, offset: 132 / 200 },
    { opacity: 0 },
  ];
  let shut = null;
  function blink() {
    if (!may() || running(shut)) return;
    shut = lid.animate(LID, 200);
    line.animate(LINE, 200);
  }

  // The blinks on their own: a 46s loop with blinks 3.5, 10.7, 16.3, 26.1 and 26.4 (the
  // double), 32.5 and 43s in, so they come every 5 to 11 seconds. A timer rather than a CSS
  // loop, so that between blinks nothing is attached to the lid at all. The loop holds where it
  // is while the bird is off screen or the page is hidden.
  const LOOP_MS = 46000, BLINK_AT = [3500, 10700, 16300, 26100, 26400, 32500, 43000];
  let loopAt = 0, loopTimer = 0, loopFrom = 0;
  function loop() {
    holdLoop();
    if (!may()) return;
    const next = BLINK_AT.find((t) => t > loopAt) ?? LOOP_MS + BLINK_AT[0];
    loopFrom = performance.now();
    loopTimer = setTimeout(() => {
      loopTimer = 0;
      loopAt = next % LOOP_MS;
      blink();
      loop();
    }, next - loopAt);
  }
  function holdLoop() {
    if (!loopTimer) return;
    clearTimeout(loopTimer);
    loopTimer = 0;
    loopAt = Math.min(LOOP_MS, loopAt + performance.now() - loopFrom);
  }

  // Arrival: once every copy of the bird has loaded and two frames have gone by (so it has
  // been painted), and the stylesheet is in force, the bird goes live: its layers come out (not
  // under reduced motion), the blink loop starts and, a beat later, the topknot flicks. If the
  // bird was already there when this script ran, that is shortly after. A copy that fails to
  // load, or a stylesheet that is not in force, leaves the bird as it is. With JavaScript off none of this runs and the
  // bird stays still, which is fine: nothing is hidden waiting for it. (No img.decode() here:
  // in Safari it changes how the bird is drawn from then on, so the page at rest would differ.)
  const ARRIVE_MS = 450;
  const loaded = (el) =>
    el.complete && el.naturalWidth
      ? Promise.resolve()
      : new Promise((done, fail) => {
          el.addEventListener("load", done, { once: true });
          el.addEventListener("error", fail, { once: true });
        });
  Promise.all([img, base, plume, pupil].map(loaded)).then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!styled()) return;
      live = true;
      if (still.matches) return;
      reveal(true);
      loop();
      setTimeout(flick, ARRIVE_MS);
    }));
  }, () => {});

  // A hover with a mouse, or a tap (or a click).
  bird.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") { flick(); blink(); }
  });
  bird.addEventListener("click", () => { flick(); blink(); });

  // The watchful eye. The pupil eases toward the pointer, at most 0.4 of the eye ring's inner
  // radius (11.4 of the master's 758 units: 1.504% of the width, 1.1987% of the height), which
  // still leaves 17.7 units of white ring all round. It goes the whole way once the pointer is
  // 220px off. On a touch screen it glances toward the last touch, and down while the page
  // scrolls down, then rests.
  const REACH_X = 1.504, REACH_Y = 1.1987, FULL_AT = 220, EASE_MS = 110;
  let cur = { x: 0, y: 0 }, aim = { x: 0, y: 0 }, frame = 0, then = 0, restTimer = 0;
  let mouse = null, lastY = scrollY;

  function lookAt(x, y) {
    const r = bird.getBoundingClientRect();
    const dx = x - (r.left + r.width * 0.219852), dy = y - (r.top + r.height * 0.338769);
    const d = Math.hypot(dx, dy);
    const k = d ? Math.min(1, d / FULL_AT) / d : 0;
    setAim(dx * k, dy * k);
  }
  function setAim(x, y) {
    aim = { x, y };
    if (!may()) return;
    if (!x && !y && !cur.x && !cur.y) return restNow();
    bird.classList.add("looking");
    if (!frame) frame = requestAnimationFrame(step);
  }
  function restSoon(ms) {
    clearTimeout(restTimer);
    restTimer = setTimeout(() => setAim(0, 0), ms);
  }
  function step(now) {
    const dt = Math.min(100, now - (then || now));
    then = now;
    const k = 1 - Math.exp(-dt / EASE_MS);
    cur.x += (aim.x - cur.x) * k;
    cur.y += (aim.y - cur.y) * k;
    const done = Math.abs(aim.x - cur.x) + Math.abs(aim.y - cur.y) < 0.002;
    if (done) cur = { ...aim };
    pupil.style.transform = `translate(${(cur.x * REACH_X).toFixed(4)}%, ${(cur.y * REACH_Y).toFixed(4)}%)`;
    if (!done && may()) { frame = requestAnimationFrame(step); return; }
    frame = 0; then = 0;
    if (!may() || (!cur.x && !cur.y)) restNow();
  }
  function restNow() {
    cancelAnimationFrame(frame);
    clearTimeout(restTimer);
    frame = 0; then = 0; cur = { x: 0, y: 0 }; aim = { x: 0, y: 0 };
    pupil.style.transform = "";
    bird.classList.remove("looking");
  }

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mouse = { x: e.clientX, y: e.clientY };
    clearTimeout(restTimer);
    lookAt(mouse.x, mouse.y);
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => { mouse = null; restSoon(600); });
  addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    lookAt(e.clientX, e.clientY);
    restSoon(1500);
  }, { passive: true });
  addEventListener("scroll", () => {
    const down = scrollY > lastY;
    lastY = scrollY;
    if (mouse) return lookAt(mouse.x, mouse.y);
    const r = bird.getBoundingClientRect();
    if (!down || r.bottom < 0 || r.top > innerHeight) return;
    setAim(0, 1);
    restSoon(1200);
  }, { passive: true });

  // The blink loop holds, and the eye rests, while the bird is off screen or the page is hidden.
  let offScreen = false;
  function hold() {
    away = offScreen || document.hidden;
    if (away) { holdLoop(); restNow(); }
    else if (!loopTimer) loop();
  }
  if (window.IntersectionObserver) {
    new IntersectionObserver((entries) => {
      offScreen = !entries[entries.length - 1].isIntersecting;
      hold();
    }).observe(bird);
  }
  document.addEventListener("visibilitychange", hold);

  // Asking for reduced motion midway stops whatever is moving and hides the layers again;
  // dropping the request lets them out and the blinks start again.
  const calm = () => {
    if (!still.matches) {
      if (live) reveal(true);
      return loop();
    }
    holdLoop();
    if (bird.getAnimations) for (const a of bird.getAnimations({ subtree: true })) a.cancel();
    restNow();
    reveal(false);
  };
  if (still.addEventListener) still.addEventListener("change", calm);
  else if (still.addListener) still.addListener(calm);
})();
