# DOM Unravel: Production-Safe 3D Hero Interaction

A minimalist, zero-dependency proof-of-concept demonstrating how to execute a "DOM explosion" effect without the performance cliffs and layout thrashing associated with live DOM mutation.

**Live Demo:** `https://github.com/ubiktime/dom-unravel-poc`

## The Strategic Problem

Most "DOM explosion" tutorials on CodePen animate the live DOM tree using `transform-style: preserve-3d` across dozens of nested nodes. In a production environment, this is catastrophic:
*   **Compositing Layer Explosion:** Triggers massive GPU memory spikes on mid-tier mobile devices.
*   **Stacking Context Fragility:** Breaks when interacting with `overflow`, `filter`, `clip-path`, or third-party widget overlays.
*   **Accessibility Hostility:** Scatters focus states and confuses screen-reader DOM trees.

## The Architectural Solution: "DOM Theatre"

This repository rejects live mutation in favour of a controlled, overlay-based illusion. The live DOM remains structurally intact and accessible at all times.

1.  **Measurement over Mutation:** JavaScript measures selected semantic nodes (`<h1>`, `<p>`, `<button>`) via `getBoundingClientRect()`.
2.  **The Overlay Illusion:** It generates fixed-position clones in an `aria-hidden` overlay, storing coordinates and explosion vectors as CSS Custom Properties (`--x`, `--y`, `--tz`).
3.  **Compositor-Only Animation:** The overlay applies `perspective`, and the clones animate strictly via `transform` and `opacity`. 
4.  **The Ghost State:** The original live DOM merely receives a CSS `opacity` and `filter: grayscale()` transition.

## Technical Constraints & Stack

*   **Zero Build Step:** Pure HTML, CSS, and Vanilla JS (ES Modules). No React, no Vite, no Webpack.
*   **Edge Deployment:** Architected for Cloudflare Pages. Designed to load and become interactive in <50ms.
*   **Progressive Enhancement:** 
    *   Respects `prefers-reduced-motion`.
    *   Automatically tears down the effect on window `resize` or `scroll` to prevent coordinate drift.
    *   Provides multiple accessible escape hatches (Esc key, overlay click, floating pill button).

## Local Execution

No `npm install` required. Serve the `public` directory using any static server.

```bash
npx serve public
