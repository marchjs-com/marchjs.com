import type { ArtSet } from "./types.ts";

/** Drawings for the Motion section (topics.ts › "/motion"). */
export const art: ArtSet = {
  // Same target, two curves: a spring that overshoots and a smooth tween.
  "spring-tween": [["path", "M12 22h126", { dash: true, o: 0.4 }], ["path", "M12 66c50 0 70-44 126-44", { color: "orange" }], ["path", "M12 66c14 0 18-56 34-54 12 2 12 16 24 14 10-2 14-4 68-4"], ["dot", 138, 22, 5, { mv: { y: -6 } }]],
  // A label, three digit blocks (the last one rolls) and a trend arrow.
  "numbers": [["ln", 30, 14, 40], ["fill", 30, 30, 18, 24, 5], ["fill", 54, 30, 18, 24, 5], ["fill", 78, 60, 18, 8, 4, { o: 0.2 }], ["fill", 78, 30, 18, 24, 5, { mv: { y: -8 } }], ["path", "M106 50l14-14m-9 0h9v9"]],
  // A list where one row is in transit to its new place.
  "flip": [["box", 20, 8, 96, 18, 6], ["ln", 30, 14.500, 50], ["box", 34, 31, 96, 18, 6, { w: 2.4, mv: { x: -14 } }], ["ln", 44, 37.500, 60, { o: 0.7, mv: { x: -14 } }], ["box", 20, 54, 96, 18, 6], ["ln", 30, 60.500, 40], ["path", "M138 26V12m-4 4 4-4 4 4"]],
  // Bars staggered from the centre outwards.
  "timeline-stagger": [["fill", 21, 54, 10, 12, 4, { o: 0.3 }], ["fill", 37, 42, 10, 24, 4, { o: 0.5 }], ["fill", 53, 30, 10, 36, 4, { o: 0.75 }], ["fill", 69, 18, 10, 48, 4, { mv: { y: -6 } }], ["fill", 85, 30, 10, 36, 4, { o: 0.75 }], ["fill", 101, 42, 10, 24, 4, { o: 0.5 }], ["fill", 117, 54, 10, 12, 4, { o: 0.3 }]],
  // A dragged card with a pointer; the dashed outline is where it springs back to.
  "gestures": [["box", 30, 24, 50, 36, 8, { dash: true, o: 0.4 }], ["box", 58, 14, 50, 36, 8, { mv: { x: -10, y: 4 } }], ["ln", 68, 24, 26, { mv: { x: -10, y: 4 } }], ["shape", "M96 40v22l6-5 4 9 4-2-4-9h8z", { mv: { x: -10, y: 4 } }]],
  // A card with a spotlight under the pointer and a few particles.
  "spotlight": [["box", 14, 10, 122, 60, 10], ["dot", 100, 24, 2], ["dot", 114, 44, 2.500, { o: 0.5 }], ["dot", 94, 56, 2, { o: 0.5 }], ["dot", 30, 22, 1.500, { o: 0.4 }], ["dot", 58, 36, 17, { o: 0.15, mv: { x: 10 } }], ["dot", 58, 36, 9, { o: 0.3, mv: { x: 10 } }], ["shape", "M58 36v16l4-4 3 7 3-1-3-7h6z", { mv: { x: 10 } }]],
  // A viewport; a block below its edge moves in.
  "reveal": [["box", 24, 6, 102, 48, 8], ["ln", 34, 16, 60, { o: 0.6 }], ["ln", 34, 27, 44], ["box", 34, 44, 82, 24, 6, { dash: true, mv: { y: -8 } }], ["ln", 42, 53.500, 40, { mv: { y: -8 } }]],
  // A path being drawn: solid so far, dashed ahead, with anchor points.
  "svg": [["path", "M14 56c20-40 36-40 50-16s34 22 46-14"], ["path", "M110 26c6-10 14-14 26-14", { dash: true, o: 0.5 }], ["fill", 11, 53, 6, 6, 1], ["box", 133, 9, 6, 6, 1], ["dot", 110, 26, 4.500, { mv: { x: 6, y: -6 } }]],
  // Square to circle through an in-between shape.
  "morph": [["box", 12, 24, 32, 32, 4], ["path", "M48 40h7", { o: 0.5 }], ["box", 59, 24, 32, 32, 12, { o: 0.6, mv: { rotate: 20 } }], ["path", "M95 40h7", { o: 0.5 }], ["ring", 122, 40, 16]],
  // A page revealed by a growing circle.
  "pages": [["box", 22, 8, 106, 64, 8], ["ln", 32, 17, 40], ["ln", 32, 60, 56], ["dot", 75, 40, 20, { o: 0.25, mv: { scale: 1.2 } }], ["ring", 75, 40, 20, { mv: { scale: 1.2 } }]],
  // A button pressed by a pointer, with a ripple.
  "micro": [["box", 36, 26, 78, 28, 14], ["ln", 50, 37.500, 26, { o: 0.6 }], ["ring", 92, 40, 6, { o: 0.7 }], ["ring", 92, 40, 11, { o: 0.35, mv: { scale: 1.2 } }], ["shape", "M92 40v16l4-4 3 7 3-1-3-7h6z"]],
  // A page and its scrollbar thumb.
  "scroll": [["box", 20, 6, 96, 68, 8], ["fill", 30, 16, 76, 20, 5, { o: 0.25 }], ["ln", 30, 44, 60], ["ln", 30, 54, 76], ["ln", 30, 64, 40], ["fill", 126, 10, 4, 60, 2, { o: 0.2 }], ["fill", 126, 16, 4, 22, 2, { mv: { y: 14 } }]],
  // A list with an add mark and a row leaving as a ghost.
  "lists": [["box", 20, 8, 92, 16, 6], ["ln", 28, 13.500, 50], ["box", 20, 30, 92, 16, 6], ["ln", 28, 35.500, 40], ["box", 30, 52, 92, 16, 6, { dash: true, o: 0.4, mv: { x: 10 } }], ["ln", 38, 57.500, 44, { o: 0.2, mv: { x: 10 } }], ["path", "M128 11v10m-5-5h10"]],
};
