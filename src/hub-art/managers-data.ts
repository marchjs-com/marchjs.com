import type { ArtSet } from "./types.ts";

/** Drawings for the data and state managers section (topics.ts › "/managers-data"). */
export const art: ArtSet = {
  // A clipboard and the sheet pasted from it.
  "clipboard": [["box", 32, 12, 54, 60, 8], ["fill", 47, 7, 24, 11, 4], ["ln", 41, 28, 36, { o: 0.6 }], ["ln", 41, 39, 28], ["ln", 41, 50, 32], ["box", 76, 30, 36, 40, 6, { mv: { x: 8 } }], ["ln", 83, 40, 20, { o: 0.6, mv: { x: 8 } }], ["ln", 83, 50, 14, { mv: { x: 8 } }]],
  // An undo arrow, the history lines and an "unsaved" dot.
  "undo": [["path", "M34 28h36a17 17 0 0 1 0 34H46", { w: 2.4, mv: { x: -4 } }], ["path", "M46 16L34 28l12 12", { w: 2.4, mv: { x: -4 } }], ["ring", 114, 24, 10, { color: "orange", o: 0.4 }], ["dot", 114, 24, 5, { color: "orange" }], ["ln", 100, 46, 28], ["ln", 100, 56, 20]],
  // Stacked disks; the top one lifts.
  "storage": [["path", "M45 22v36c0 6 13 9 30 9s30-3 30-9V22"], ["path", "M45 34c0 6 13 9 30 9s30-3 30-9"], ["path", "M45 46c0 6 13 9 30 9s30-3 30-9"], ["path", "M45 22c0-6 13-9 30-9s30 3 30 9-13 9-30 9-30-3-30-9z", { mv: { y: -4 } }], ["dot", 55, 50, 2, { o: 0.5 }]],
  // A cached entry and the clock that says how fresh it is.
  "cache": [["box", 14, 22, 56, 36, 8], ["ln", 22, 31, 30, { o: 0.7 }], ["ln", 22, 43, 40], ["path", "M74 40h12m-4-4 4 4-4 4", { mv: { x: 3 } }], ["ring", 112, 40, 20], ["path", "M112 27v13l9 6"]],
  // Three setting tracks with knobs at different places.
  "config": [["fill", 20, 18, 110, 3, 1.500, { o: 0.25 }], ["dot", 50, 19.500, 6], ["fill", 20, 38, 110, 3, 1.500, { o: 0.25 }], ["dot", 98, 39.500, 6, { mv: { x: -18 } }], ["fill", 20, 58, 110, 3, 1.500, { o: 0.25 }], ["dot", 72, 59.500, 6]],
};
