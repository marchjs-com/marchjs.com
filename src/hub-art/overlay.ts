import type { ArtSet } from "./types.ts";

/** Drawings for the Overlay section (topics.ts › "/overlay"). */
export const art: ArtSet = {
  // A card with decoration behind its content; the dashed layer does not take clicks.
  overlay: [["box", 20, 10, 110, 60, 10], ["dot", 108, 30, 13, { o: 0.2 }], ["ring", 96, 50, 8, { o: 0.3 }], ["box", 26, 16, 98, 48, 6, { dash: true, o: 0.45, mv: { x: 4, y: -4 } }], ["ln", 34, 28, 44, { o: 0.7 }], ["ln", 34, 39, 30], ["fill", 34, 50, 30, 10, 5]],
  // Three tiles: an image, a video, and the fallback text of one that failed.
  media: [["box", 10, 20, 38, 40, 6], ["dot", 22, 31, 3], ["path", "M14 54l9-11 6 6 5-5 10 10"], ["box", 56, 20, 38, 40, 6], ["shape", "M70 32l12 8-12 8z", { mv: { scale: 1.2 } }], ["box", 102, 20, 38, 40, 6, { dash: true, o: 0.6 }], ["ln", 110, 34, 22], ["ln", 110, 43, 14]],
  // A slide between the tips of its neighbours, with position dots.
  carousel: [["fill", 10, 18, 22, 32, 6, { o: 0.2, mv: { x: -4 } }], ["box", 38, 10, 74, 46, 8, { mv: { x: -4 } }], ["ln", 48, 22, 40, { o: 0.6, mv: { x: -4 } }], ["ln", 48, 33, 26, { mv: { x: -4 } }], ["fill", 118, 18, 22, 32, 6, { o: 0.2, mv: { x: -4 } }], ["dot", 63, 67, 2.5, { o: 0.3 }], ["fill", 69, 64.5, 12, 5, 2.5], ["dot", 87, 67, 2.5, { o: 0.3 }]],
  // One picture: sun and hills in a frame, its alternative text below.
  picture: [["box", 30, 8, 90, 52, 8], ["dot", 52, 24, 5, { mv: { y: -4 } }], ["shape", "M36 55l20-21 14 14 10-9 24 16z", { o: 0.4 }], ["ln", 48, 66, 54]],
  // A round mark on the corner of an image.
  "corner-mark": [["box", 42, 14, 60, 56, 10], ["fill", 42, 14, 60, 56, 10, { o: 0.15 }], ["path", "M50 60l13-15 9 9 8-7 14 13", { o: 0.5 }], ["box", 88, 6, 24, 24, 12, { w: 2, mv: { scale: 1.15 } }], ["shape", "M96.5 13l8 5-8 5z", { mv: { scale: 1.15 } }]],
};
