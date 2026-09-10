const hero = document.querySelector("[data-unravel]");
const toggle = document.querySelector("[data-unravel-toggle]");

if (!hero || !toggle) {
  throw new Error("DOM Unravel: missing hero or toggle element.");
}

const overlay = document.createElement("div");
overlay.className = "unravel-overlay";
overlay.setAttribute("aria-hidden", "true");
document.body.appendChild(overlay);

const pill = document.createElement("button");
pill.type = "button";
pill.className = "unravel-pill";
pill.textContent = "Reassemble hero — or click anywhere / press Esc";
pill.hidden = true;
document.body.appendChild(pill);

let active = false;
let busy = false;

const presets = {
  1: { tx: -46, ty: -30, tz: 90, rx: 8, ry: -7 },
  2: { tx: 30, ty: 18, tz: 180, rx: -6, ry: 9 },
  3: { tx: 84, ty: -48, tz: 280, rx: 10, ry: -13 },
};

const waitFrames = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

function clearOverlay() {
  overlay.replaceChildren();
}

function buildClones() {
  clearOverlay();

  const targets = hero.querySelectorAll("[data-dom-label]");

  targets.forEach((element, index) => {
    const rect = element.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return;

    const clone = document.createElement("div");
    clone.className = "unravel-clone";
    clone.dataset.tag = element.tagName.toLowerCase();

    const depth = Number(element.dataset.depth || (index % 3) + 1);
    const preset = presets[depth] || presets[2];

    clone.style.setProperty("--x", `${Math.round(rect.left)}px`);
    clone.style.setProperty("--y", `${Math.round(rect.top)}px`);
    clone.style.setProperty("--w", `${Math.round(rect.width)}px`);
    clone.style.setProperty("--h", `${Math.round(rect.height)}px`);

    clone.style.setProperty("--tx", `${preset.tx}px`);
    clone.style.setProperty("--ty", `${preset.ty}px`);
    clone.style.setProperty("--tz", `${preset.tz}px`);
    clone.style.setProperty("--rx", `${preset.rx}deg`);
    clone.style.setProperty("--ry", `${preset.ry}deg`);

    clone.style.transitionDelay = `${index * 45}ms`;

    overlay.appendChild(clone);
  });
}

function explode() {
  overlay.classList.add("is-exploded");
  hero.classList.add("is-ghost");
  pill.hidden = false;
  toggle.setAttribute("aria-pressed", "true");
  toggle.textContent = "Reassemble hero";
}

function deactivate() {
  overlay.classList.remove("is-exploded");
  hero.classList.remove("is-ghost");
  pill.hidden = true;
  toggle.setAttribute("aria-pressed", "false");
  toggle.textContent = "Unravel hero";

  active = false;

  window.setTimeout(() => {
    clearOverlay();
    busy = false;
  }, 700);
}

function cancelIfActive() {
  if (!active || busy) return;
  busy = true;
  deactivate();
}

toggle.addEventListener("click", async () => {
  if (busy) return;
  busy = true;

  if (!active) {
    buildClones();
    await waitFrames();
    explode();
    active = true;
    busy = false;
  } else {
    deactivate();
  }
});

pill.addEventListener("click", () => {
  if (!active || busy) return;
  busy = true;
  deactivate();
});

overlay.addEventListener("click", () => {
  if (!active || busy) return;
  busy = true;
  deactivate();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!active || busy) return;
  busy = true;
  deactivate();
});

window.addEventListener("resize", cancelIfActive, { passive: true });
window.addEventListener("scroll", cancelIfActive, {
  capture: true,
  passive: true,
});