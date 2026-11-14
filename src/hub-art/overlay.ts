import type { ArtSet } from "./types.ts";

/** Drawings for the Overlay section (topics.ts › "/overlay"). */
export const art: ArtSet = {
  // A video behind a card (play mark) and a glass panel over it.
  "video-glass": [["fill", 14, 8, 122, 64, 10, { o: 0.15 }], ["ring", 116, 24, 9], ["shape", "M113 19.5l8 4.5-8 4.5z", { mv: { scale: 1.2 } }], ["box", 30, 32, 78, 32, 8], ["ln", 40, 40, 40, { o: 0.7 }], ["ln", 40, 51, 54]],
  // The same image in three frames: cover, contain, and placed by a focus point.
  image: [["box", 10, 20, 38, 40, 5], ["fill", 10, 20, 38, 40, 5, { o: 0.3 }], ["dot", 22, 31, 3], ["box", 56, 20, 38, 40, 5], ["fill", 56, 31, 38, 18, 0, { o: 0.3 }], ["dot", 65, 37, 2.5], ["box", 102, 20, 38, 40, 5], ["fill", 106, 32, 22, 22, 3, { o: 0.3, mv: { x: 8, y: -8 } }], ["dot", 112, 38, 2.5, { mv: { x: 8, y: -8 } }]],
  // A card filled with a repeating wave pattern.
  "svg-pattern": [["box", 14, 8, 122, 64, 10], ["path", "M27 24q8-8 16 0t16 0 16 0 16 0 16 0 16 0", { o: 0.45 }], ["path", "M23 40q8-8 16 0t16 0 16 0 16 0 16 0 16 0", { mv: { x: 8 } }], ["path", "M27 56q8-8 16 0t16 0 16 0 16 0 16 0 16 0", { o: 0.45 }]],
  // A drawing surface: guides, a drawn curve and a moving point.
  canvas: [["box", 14, 8, 122, 64, 8], ["path", "M14 40h122M75 8v64", { dash: true, o: 0.25, w: 1 }], ["path", "M26 54c10-30 22-30 30-10s22 16 30-8 16-18 26-10", { w: 2.2 }], ["dot", 112, 26, 4.5, { color: "orange", mv: { x: 8, y: 6 } }]],
  // Stacked sheets; the top one lifts.
  layers: [["path", "M31 53l44 15 44-15", { o: 0.5 }], ["path", "M31 39l44 15 44-15"], ["shape", "M75 10l44 15-44 15-44-15z", { o: 0.25, mv: { y: -5 } }], ["path", "M75 10l44 15-44 15-44-15z", { mv: { y: -5 } }]],
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
