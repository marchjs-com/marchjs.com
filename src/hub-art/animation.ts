import type { ArtSet } from "./types.ts";

/** Drawings for the Animation engine section (topics.ts › "/animation"). */
export const art: ArtSet = {
  // A pause button and a speed slider.
  "global-control": [["ring", 32, 40, 16], ["fill", 26, 33, 4, 14, 1], ["fill", 34, 33, 4, 14, 1], ["fill", 62, 38, 76, 4, 2, { o: 0.2 }], ["fill", 62, 38, 40, 4, 2], ["dot", 102, 40, 7, { mv: { x: 14 } }], ["dot", 63, 54, 1.500, { o: 0.4 }], ["dot", 100, 54, 1.500, { o: 0.4 }], ["dot", 137, 54, 1.500, { o: 0.4 }]],
  // One engine driving three targets: a card, a wave and a gradient.
  "one-engine": [["path", "M35 40c30 0 30-25 60-25", { o: 0.5 }], ["path", "M35 40h60", { o: 0.5 }], ["path", "M35 40c30 0 30 25 60 25", { o: 0.5 }], ["ring", 22, 40, 13, { o: 0.3, mv: { scale: 1.2 } }], ["dot", 22, 40, 8], ["box", 98, 6, 40, 18, 5], ["ln", 105, 12.500, 22], ["box", 98, 31, 40, 18, 5], ["path", "M104 40c5-8 9-8 14 0s9 8 14 0"], ["fill", 98, 56, 40, 18, 5, { o: 0.35 }]],
  // A gallery of tiles, each with its own little motion mark.
  "presets": [["box", 15, 8, 34, 28, 6], ["dot", 32, 22, 5, { mv: { scale: 1.2 } }], ["box", 58, 8, 34, 28, 6], ["ring", 75, 22, 6], ["box", 101, 8, 34, 28, 6], ["fill", 112, 16, 12, 12, 3], ["box", 15, 44, 34, 28, 6], ["path", "M24 63l5-10 5 10 5-10"], ["box", 58, 44, 34, 28, 6], ["path", "M67 58h14m-5-5 5 5-5 5"], ["box", 101, 44, 34, 28, 6], ["fill", 109, 55, 18, 6, 3]],
  // Tracks with bars and a playhead over a seek line.
  "timeline-editor": [["fill", 18, 14, 50, 10, 4], ["fill", 46, 30, 64, 10, 4, { o: 0.6 }], ["fill", 84, 46, 48, 10, 4, { o: 0.35 }], ["fill", 10, 68, 130, 3, 1.500, { o: 0.2 }], ["fill", 74, 8, 2, 62, 1, { color: "orange", mv: { x: 14 } }], ["shape", "M70 6h10l-5 7z", { color: "orange", mv: { x: 14 } }]],
  // A cubic-bezier curve with its two handles.
  "curve-editor": [["box", 41, 6, 68, 68, 6], ["path", "M47 68L80 66", { o: 0.5 }], ["path", "M103 12L60 14", { o: 0.5 }], ["path", "M47 68C80 66 60 14 103 12", { w: 2.4 }], ["dot", 47, 68, 2], ["dot", 103, 12, 2], ["dot", 80, 66, 3.500, { color: "orange" }], ["dot", 60, 14, 3.500, { color: "orange", mv: { x: 8 } }]],
  // A grid of dots, largest at the centre where the stagger starts.
  "stagger-200": [
    ["dot", 27, 24, 2.200, { o: 0.35 }], ["dot", 43, 24, 3.200, { o: 0.55 }], ["dot", 59, 24, 4.500, { o: 0.8 }], ["dot", 75, 24, 4.500, { o: 0.8 }], ["dot", 91, 24, 4.500, { o: 0.8 }], ["dot", 107, 24, 3.200, { o: 0.55 }], ["dot", 123, 24, 2.200, { o: 0.35 }],
    ["dot", 27, 40, 2.200, { o: 0.35 }], ["dot", 43, 40, 3.200, { o: 0.55 }], ["dot", 59, 40, 4.500, { o: 0.8 }], ["dot", 75, 40, 6, { mv: { scale: 1.2 } }], ["dot", 91, 40, 4.500, { o: 0.8 }], ["dot", 107, 40, 3.200, { o: 0.55 }], ["dot", 123, 40, 2.200, { o: 0.35 }],
    ["dot", 27, 56, 2.200, { o: 0.35 }], ["dot", 43, 56, 3.200, { o: 0.55 }], ["dot", 59, 56, 4.500, { o: 0.8 }], ["dot", 75, 56, 4.500, { o: 0.8 }], ["dot", 91, 56, 4.500, { o: 0.8 }], ["dot", 107, 56, 3.200, { o: 0.55 }], ["dot", 123, 56, 2.200, { o: 0.35 }],
  ],
  // Keyframe diamonds flowing into one stylesheet file.
  "keyframes-css": [["shape", "M22 34l6 6-6 6-6-6z"], ["shape", "M42 34l6 6-6 6-6-6z", { o: 0.6 }], ["shape", "M62 34l6 6-6 6-6-6z", { o: 0.35 }], ["path", "M72 40h10m-4-4 4 4-4 4", { mv: { x: 3 } }], ["path", "M88 8h30l16 16v48H88z"], ["path", "M118 8v16h16"], ["ln", 96, 34, 28, { o: 0.6 }], ["ln", 96, 45, 22], ["ln", 96, 56, 30]],
};
