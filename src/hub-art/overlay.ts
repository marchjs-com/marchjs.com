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
  // A wide LED sign: a row of dots with a heart sliding in.
  "led-board": [["fill", 8, 14, 134, 52, 8, { o: 0.12 }], ["dot", 26, 40, 3], ["dot", 34, 40, 3], ["dot", 42, 40, 3], ["dot", 50, 32, 3], ["dot", 50, 48, 3], ["dot", 62, 40, 3, { o: 0.4 }], ["shape", "M100 34a6 6 0 0 1 10 0a6 6 0 0 1 10 0c0 8-10 14-10 14s-10-6-10-14z", { color: "pink", mv: { x: -8 } }]],
  // Two eyes on a dark panel, the pupils glancing aside.
  "led-eyes": [["fill", 20, 10, 110, 60, 12, { o: 0.12 }], ["box", 40, 22, 26, 30, 8], ["box", 84, 22, 26, 30, 8], ["dot", 53, 37, 5, { mv: { x: -6 } }], ["dot", 97, 37, 5, { mv: { x: -6 } }], ["path", "M62 60q13 6 26 0", { o: 0.6 }]],
  // A grid of dots, some lit.
  "led-matrix": [["fill", 22, 8, 106, 64, 8, { o: 0.12 }], ["dot", 45, 26, 4], ["dot", 60, 26, 4, { o: 0.3 }], ["dot", 75, 26, 4], ["dot", 90, 26, 4, { o: 0.3 }], ["dot", 105, 26, 4], ["dot", 45, 41, 4, { o: 0.3 }], ["dot", 60, 41, 4], ["dot", 75, 41, 4, { mv: { scale: 1.3 } }], ["dot", 90, 41, 4], ["dot", 105, 41, 4, { o: 0.3 }], ["dot", 60, 56, 4, { o: 0.3 }], ["dot", 75, 56, 4], ["dot", 90, 56, 4, { o: 0.3 }]],
  // Pixel letters: an A made of small squares.
  "pixel-font": [["fill", 52, 18, 8, 8, 1], ["fill", 44, 26, 8, 8, 1], ["fill", 60, 26, 8, 8, 1], ["fill", 44, 34, 8, 8, 1], ["fill", 52, 34, 8, 8, 1], ["fill", 60, 34, 8, 8, 1], ["fill", 44, 42, 8, 8, 1], ["fill", 60, 42, 8, 8, 1], ["fill", 84, 26, 8, 8, 1, { color: "pink" }], ["fill", 92, 34, 8, 8, 1, { color: "pink", mv: { y: -4 } }], ["fill", 100, 26, 8, 8, 1, { color: "pink" }]],
  // A pixel flame flickering.
  "pixel-sprite": [["fill", 67, 14, 8, 8, 1, { color: "orange", mv: { x: 4 } }], ["fill", 59, 22, 16, 8, 1, { color: "orange" }], ["fill", 59, 30, 32, 8, 1, { color: "orange" }], ["fill", 51, 38, 48, 8, 1, { color: "orange" }], ["fill", 59, 46, 32, 8, 1, { color: "gold" }], ["fill", 59, 54, 32, 8, 1, { color: "orange" }]],
};
