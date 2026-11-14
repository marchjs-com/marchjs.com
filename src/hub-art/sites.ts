import type { ArtSet } from "./types.ts";

/** Drawings for the sample sites section (topics.ts › "/sites"): a small schema of each landing page. */
export const art: ArtSet = {
  // Floating menu, headline and the product frame below.
  "product": [["box", 14, 6, 122, 68, 8], ["fill", 44, 11, 62, 8, 4, { o: 0.3 }], ["fill", 50, 25, 50, 6, 3, { o: 0.9 }], ["ln", 58, 35, 34], ["fill", 38, 46, 74, 24, 5, { o: 0.25, mv: { y: -3 } }]],
  // Avatar and name, then a row of project covers.
  "portfolio": [["box", 14, 6, 122, 68, 8], ["dot", 30, 19, 6], ["ln", 42, 13, 36, { o: 0.7 }], ["ln", 42, 22, 24], ["fill", 24, 34, 30, 32, 5, { o: 0.3 }], ["fill", 60, 34, 30, 32, 5, { o: 0.5, mv: { scale: 1.1 } }], ["fill", 96, 34, 30, 32, 5, { o: 0.3 }]],
  // A deck: the front slide moves aside to show the next one.
  "slides": [["box", 34, 8, 96, 54, 6, { o: 0.4 }], ["box", 20, 16, 96, 54, 6, { mv: { x: -8 } }], ["fill", 30, 26, 40, 7, 3, { mv: { x: -8 } }], ["ln", 30, 40, 60, { mv: { x: -8 } }], ["ln", 30, 50, 44, { mv: { x: -8 } }], ["path", "M136 36l6 7-6 7"]],
  // The old screen (dashed) and the new one, with a divider between.
  "redesign": [["box", 30, 6, 40, 68, 8, { dash: true, o: 0.5 }], ["ln", 36, 16, 28, { o: 0.2 }], ["ln", 36, 26, 28, { o: 0.2 }], ["ln", 36, 36, 28, { o: 0.2 }], ["ln", 36, 46, 28, { o: 0.2 }], ["box", 80, 6, 40, 68, 8], ["fill", 86, 14, 28, 18, 4, { o: 0.4 }], ["ln", 86, 38, 28, { o: 0.6 }], ["ln", 86, 48, 18], ["fill", 86, 58, 28, 9, 4], ["fill", 74, 6, 2, 68, 1, { mv: { x: 8 } }], ["dot", 75, 40, 6, { mv: { x: 8 } }]],
  // "Not for you" crosses on the left, an honest comparison on the right.
  "honest": [["box", 10, 8, 62, 64, 8], ["path", "m17 23 6 6m0-6-6 6", { color: "orange" }], ["ln", 30, 23.500, 32, { o: 0.6 }], ["path", "m17 47 6 6m0-6-6 6", { color: "orange", mv: { scale: 1.2 } }], ["ln", 30, 47.500, 26, { o: 0.6 }], ["box", 78, 8, 62, 64, 8], ["ln", 86, 23.500, 20], ["dot", 116, 26, 3.500], ["dot", 129, 26, 3.500, { o: 0.4 }], ["ln", 86, 47.500, 24], ["ring", 116, 50, 3.500, { color: "orange" }], ["dot", 129, 50, 3.500, { o: 0.4 }]],
  // Growing counters with a live dot above a wall of events.
  "live": [["box", 14, 8, 18, 24, 5], ["fill", 19, 16, 8, 8, 2], ["box", 35, 8, 18, 24, 5], ["fill", 40, 16, 8, 8, 2], ["box", 56, 8, 18, 24, 5], ["fill", 61, 16, 8, 8, 2], ["ring", 90, 20, 8, { color: "green", o: 0.4, mv: { scale: 1.2 } }], ["dot", 90, 20, 4, { color: "green" }], ["ln", 104, 17.500, 32], ["fill", 14, 42, 58, 12, 4, { o: 0.2 }], ["fill", 78, 42, 58, 12, 4, { o: 0.3 }], ["fill", 14, 58, 58, 12, 4, { o: 0.3 }], ["fill", 78, 58, 58, 12, 4, { o: 0.2 }]],
  // The path so far, then a prompt with two choices.
  "story": [["dot", 55, 14, 3], ["path", "M59 14h12"], ["dot", 75, 14, 3], ["path", "M79 14h12"], ["ring", 95, 14, 3.500], ["box", 20, 26, 110, 46, 8], ["ln", 30, 34, 70, { o: 0.7 }], ["fill", 30, 48, 42, 16, 6, { mv: { scale: 1.08 } }], ["box", 78, 48, 42, 16, 6]],
};
