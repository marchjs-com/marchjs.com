import type { ArtSet } from "./types.ts";

/** Drawings for the Speed section (topics.ts › "/speed"). */
export const art: ArtSet = {
  // A weak signal and a page whose parts arrive one by one.
  "slow-3g": [["fill", 14, 48, 6, 10, 2], ["fill", 24, 40, 6, 18, 2, { o: 0.25 }], ["fill", 34, 32, 6, 26, 2, { o: 0.25 }], ["fill", 44, 24, 6, 34, 2, { o: 0.25 }], ["box", 64, 10, 76, 60, 8], ["fill", 72, 18, 60, 12, 4, { o: 0.5 }], ["fill", 72, 36, 28, 26, 4, { o: 0.25 }], ["box", 104, 36, 28, 26, 4, { dash: true, o: 0.5, mv: { y: -4 } }]],
  // A menu whose active mark jumps at once, with the progress bar on top.
  "instant": [["fill", 10, 8, 130, 3, 1.500, { o: 0.2 }], ["fill", 10, 8, 50, 3, 1.500], ["fill", 10, 29.500, 40, 12, 4, { o: 0.2, mv: { y: 14 } }], ["ln", 14, 19, 30], ["ln", 14, 33, 26, { o: 0.7 }], ["ln", 14, 47, 28, { o: 0.7 }], ["ln", 14, 61, 22], ["box", 58, 20, 82, 52, 8], ["ln", 66, 30, 40, { o: 0.6 }], ["ln", 66, 42, 62], ["ln", 66, 52, 50]],
  // The build's chunks as blocks: loaded ones filled, the rest dashed.
  "parts": [["fill", 10, 10, 50, 36, 5], ["fill", 64, 10, 34, 16, 4, { o: 0.6 }], ["box", 102, 10, 38, 16, 4, { dash: true, o: 0.6 }], ["fill", 64, 30, 22, 16, 4, { o: 0.35 }], ["box", 90, 30, 50, 16, 4, { dash: true, mv: { y: -3 } }], ["fill", 10, 50, 30, 20, 4, { o: 0.5 }], ["box", 44, 50, 42, 20, 4, { dash: true, o: 0.6 }], ["fill", 90, 50, 50, 20, 4, { o: 0.25 }]],
  // A waterfall: each file starts later than the one above.
  "network-log": [["ln", 10, 13, 26], ["fill", 44, 12, 30, 7, 3], ["ln", 10, 29, 20], ["fill", 62, 28, 44, 7, 3, { o: 0.7 }], ["ln", 10, 45, 28], ["fill", 80, 44, 24, 7, 3, { o: 0.5 }], ["ln", 10, 61, 18], ["fill", 98, 60, 36, 7, 3, { o: 0.35, mv: { x: 6 } }]],
  // Size bars per route, against a dashed budget line.
  "route-size": [["ln", 10, 13, 24], ["fill", 42, 12, 96, 7, 3], ["ln", 10, 29, 18], ["fill", 42, 28, 70, 7, 3, { o: 0.7 }], ["ln", 10, 45, 26], ["fill", 42, 44, 44, 7, 3, { o: 0.5 }], ["ln", 10, 61, 20], ["fill", 42, 60, 26, 7, 3, { o: 0.35 }], ["path", "M124 6v68", { dash: true, color: "orange", mv: { x: -4 } }]],
  // A crossed-out cloud and the local cache that answers instead.
  "offline": [["path", "M40 52a12 12 0 0 1 2-24 16 16 0 0 1 30 4 10 10 0 0 1 0 20z"], ["path", "M34 22l44 38", { color: "orange" }], ["path", "M92 28c0-4 8-6 16-6s16 2 16 6-8 6-16 6-16-2-16-6z", { mv: { y: -3 } }], ["path", "M92 28v26c0 4 8 6 16 6s16-2 16-6V28"], ["path", "M92 41c0 4 8 6 16 6s16-2 16-6"]],
};
