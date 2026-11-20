import type { ArtSet } from "./types.ts";

/** Drawings for the Feedback section (topics.ts › "/feedback"). */
export const art: ArtSet = {
  alert: [
    ["box", 10, 20, 130, 40, 10], ["fill", 10, 20, 130, 40, 10, { o: 0.1 }], ["ring", 30, 40, 8, { w: 2, mv: { scale: 1.15 } }],
    ["path", "M30 35.5v5M30 44.5h0", { w: 2.2, mv: { scale: 1.15 } }], ["ln", 46, 31.5, 50, { o: 0.7 }], ["ln", 46, 43, 62],
    ["path", "m122 30 6 6m0-6-6 6", { o: 0.6 }],
  ],
  // An empty tray, two lines saying what to do and the button that does it.
  empty: [
    ["path", "M57 8h36l10 16v12H47V24ZM47 24h16c0 5 5 7 12 7s12-2 12-7h16", { o: 0.7 }],
    ["ln", 45, 43, 60, { o: 0.6 }], ["ln", 57, 52, 36], ["fill", 57, 62, 36, 12, 6, { mv: { scale: 1.12 } }],
  ],
  "error-box": [
    ["box", 10, 14, 130, 52, 10, { color: "pink" }], ["path", "M30 26l10 18H20Z", { color: "pink", w: 2 }], ["path", "M30 32v5M30 40.5h0", { color: "pink", w: 2 }],
    ["ln", 50, 25, 50, { o: 0.7 }], ["ln", 50, 36, 74], ["fill", 50, 48, 40, 11, 5, { mv: { scale: 1.12 } }],
  ],
  "status-dot": [
    ["ring", 42, 20, 9, { color: "green", o: 0.45, mv: { scale: 1.25 } }], ["dot", 42, 20, 5, { color: "green" }], ["ln", 60, 17.5, 60, { o: 0.6 }],
    ["dot", 42, 40, 5, { color: "orange" }], ["ln", 60, 37.5, 46, { o: 0.6 }], ["dot", 42, 60, 5, { o: 0.35 }], ["ln", 60, 57.5, 54],
  ],
  // Yes, no, partly.
  "check-mark": [
    ["path", "m25 38 7 7 13-14", { color: "green", w: 3.2, mv: { scale: 1.2 } }], ["path", "m68 31 14 14m0-14-14 14", { color: "pink", w: 3.2 }],
    ["path", "M106 38h18", { w: 3.2, o: 0.6 }], ["ln", 23, 56, 24], ["ln", 63, 56, 24], ["ln", 103, 56, 24],
  ],
  // A line that announces what changed: a source, its waves, the message.
  "live-status": [
    ["box", 8, 18, 134, 44, 10], ["dot", 24, 40, 4], ["path", "M31 33a10 10 0 0 1 0 14", { w: 2, mv: { x: 3 } }],
    ["path", "M37 28a17 17 0 0 1 0 24", { w: 2, o: 0.5, mv: { x: 3 } }], ["ln", 58, 31.5, 56, { o: 0.7 }], ["ln", 58, 43, 38],
    ["fill", 116, 30, 16, 10, 5, { o: 0.25 }],
  ],
  progress: [
    ["fill", 14, 18, 122, 8, 4, { o: 0.2 }], ["fill", 14, 18, 78, 8, 4], ["fill", 14, 36, 122, 8, 4, { o: 0.2 }],
    ["fill", 40, 36, 40, 8, 4, { color: "blue", mv: { x: 30 } }], ["fill", 14, 54, 122, 8, 4, { o: 0.2 }], ["fill", 14, 54, 104, 8, 4, { color: "green" }],
  ],
  skeleton: [
    ["dot", 28, 22, 12, { o: 0.22 }], ["fill", 48, 13, 72, 8, 4, { o: 0.22 }], ["fill", 48, 26, 48, 8, 4, { o: 0.22 }],
    ["fill", 14, 44, 122, 8, 4, { o: 0.22 }], ["fill", 14, 58, 88, 8, 4, { o: 0.22 }], ["fill", 44, 8, 12, 64, 6, { o: 0.14, mv: { x: 30 } }],
  ],
  // Two opposite arcs, so the pair turns around the ring's centre.
  spinner: [
    ["ring", 75, 40, 20, { o: 0.2, w: 4 }], ["path", "M75 20a20 20 0 0 1 20 20M75 60a20 20 0 0 1-20-20", { w: 4, mv: { rotate: 20 } }],
  ],
  // An area whose content is on its way: faint lines behind three bouncing dots.
  loader: [
    ["box", 14, 8, 122, 64, 10], ["ln", 24, 18, 60, { o: 0.12 }], ["ln", 24, 58, 80, { o: 0.12 }],
    ["dot", 59, 40, 5, { o: 0.5 }], ["dot", 75, 40, 5, { mv: { y: -7 } }], ["dot", 91, 40, 5, { o: 0.5 }],
  ],
};
