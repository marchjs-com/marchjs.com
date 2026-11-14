import type { ArtSet } from "./types.ts";

/** Drawings for the operations managers section (topics.ts › "/managers-ops"). */
export const art: ArtSet = {
  // A flag, two feature switches and a rollout percentage.
  "flags": [["path", "M22 12v58", { w: 2.4 }], ["shape", "M22 14h30l-7 10 7 10H22z"], ["box", 70, 14, 24, 14, 7], ["dot", 87, 21, 4], ["ln", 100, 18.500, 34, { o: 0.6 }], ["box", 70, 36, 24, 14, 7], ["dot", 77, 43, 4, { o: 0.5, mv: { x: 10 } }], ["ln", 100, 40.500, 26], ["fill", 70, 60, 66, 5, 2.500, { o: 0.2 }], ["fill", 70, 60, 26, 5, 2.500]],
  // Log lines with level dots; the newest comes in at the bottom.
  "log": [["box", 8, 6, 134, 68, 8], ["dot", 20, 16.500, 3], ["ln", 30, 14, 90], ["dot", 20, 27.500, 3], ["ln", 30, 25, 70], ["dot", 20, 38.500, 3, { color: "orange" }], ["ln", 30, 36, 100, { o: 0.7, color: "orange" }], ["dot", 20, 49.500, 3], ["ln", 30, 47, 56], ["dot", 20, 60.500, 3, { mv: { x: 4 } }], ["ln", 30, 58, 80, { o: 0.7, mv: { x: 4 } }]],
  // A gauge with a needle, next to three metric bars.
  "perf": [["path", "M30 58a30 30 0 0 1 60 0", { w: 5, o: 0.25 }], ["path", "M30 58a30 30 0 0 1 45-26", { w: 5, color: "green" }], ["path", "M60 58l12-21", { w: 2.4 }], ["dot", 60, 58, 4], ["fill", 104, 40, 7, 18, 2], ["fill", 115, 30, 7, 28, 2, { o: 0.6, mv: { y: -4 } }], ["fill", 126, 46, 7, 12, 2, { o: 0.35 }]],
  // Many incoming ticks, a few let through.
  "rate": [["fill", 16, 14, 3, 12, 1.500, { o: 0.4 }], ["fill", 32, 14, 3, 12, 1.500, { o: 0.4 }], ["fill", 48, 14, 3, 12, 1.500, { o: 0.4 }], ["fill", 64, 14, 3, 12, 1.500, { o: 0.4 }], ["fill", 80, 14, 3, 12, 1.500, { o: 0.4 }], ["fill", 96, 14, 3, 12, 1.500, { o: 0.4 }], ["fill", 112, 14, 3, 12, 1.500, { o: 0.4 }], ["fill", 128, 14, 3, 12, 1.500, { o: 0.4 }], ["path", "M73.500 32v10m-4-4 4 4 4-4", { mv: { y: 3 } }], ["fill", 15.500, 50, 4, 16, 2], ["fill", 63.500, 50, 4, 16, 2], ["fill", 111.500, 50, 4, 16, 2]],
};
