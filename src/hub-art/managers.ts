import type { ArtSet } from "./types.ts";

/** Drawings for the core managers section (topics.ts › "/managers"). */
export const art: ArtSet = {
  // Three screen sizes: desktop, tablet, phone.
  "viewport": [["box", 12, 10, 96, 54, 6], ["ln", 20, 20, 40], ["ln", 20, 30, 30], ["box", 74, 22, 40, 48, 6], ["box", 112, 36, 26, 36, 5, { mv: { scale: 1.1 } }]],
  // A page with a consent banner: cookie, text, accept and decline.
  "consent": [["box", 10, 6, 130, 68, 8], ["ln", 20, 16, 60, { o: 0.2 }], ["ln", 20, 26, 80, { o: 0.2 }], ["box", 18, 38, 114, 30, 7, { w: 2.4, mv: { y: -3 } }], ["ring", 33, 53, 8, { mv: { y: -3 } }], ["dot", 30, 50, 1.500, { mv: { y: -3 } }], ["dot", 36, 54, 1.500, { mv: { y: -3 } }], ["dot", 31, 57, 1.200, { mv: { y: -3 } }], ["ln", 48, 44, 34, { o: 0.6, mv: { y: -3 } }], ["fill", 48, 54, 26, 9, 4.500, { mv: { y: -3 } }], ["box", 78, 54, 26, 9, 4.500, { mv: { y: -3 } }]],
  // A command palette: prompt, results with key caps, a moving selection.
  "command": [["box", 20, 6, 110, 68, 9], ["path", "M30 14l4 4-4 4"], ["ln", 40, 15.500, 40, { o: 0.6 }], ["path", "M20 28h110", { o: 0.3 }], ["fill", 26, 33, 98, 14, 5, { o: 0.18, mv: { y: 17 } }], ["ln", 32, 37.500, 44, { o: 0.7 }], ["box", 104, 35, 14, 10, 3], ["ln", 32, 54.500, 36, { o: 0.7 }], ["box", 104, 52, 14, 10, 3]],
};
