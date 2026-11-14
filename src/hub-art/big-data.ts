import type { ArtSet } from "./types.ts";

/** Drawings for the Big data section (topics.ts › "/big-data"). */
export const art: ArtSet = {
  // A dense cell grid: header, frozen first column, a selected cell that moves down.
  "data-grid": [["box", 8, 8, 134, 64, 6], ["fill", 8, 8, 134, 14, 6, { o: 0.16 }], ["fill", 8, 22, 32, 50, 0, { o: 0.08 }], ["path", "M8 22h134M8 34.5h134M8 47h134M8 59.5h134M40 8v64M74 8v64M108 8v64", { o: 0.3, w: 1 }], ["ln", 14, 26, 18, { o: 0.6 }], ["ln", 46, 26, 20], ["ln", 114, 26, 18], ["ln", 14, 38.5, 20, { o: 0.6 }], ["ln", 80, 38.5, 20, { o: 0.7 }], ["ln", 14, 51, 16, { o: 0.6 }], ["ln", 46, 51, 22], ["box", 74, 34.5, 34, 12.5, 2, { w: 2.4, mv: { y: 12.5 } }]],
  // Search on top, a long tree below with a scrollbar; a node is dragged.
  "tree-view": [["box", 10, 8, 130, 17, 8], ["ring", 21, 16, 3.5], ["path", "m23.5 18.5 3 3"], ["ln", 32, 14, 40], ["path", "m13 35 5 5 5-5"], ["ln", 30, 34, 44, { o: 0.7 }], ["path", "M18 44v22", { o: 0.3, w: 1 }], ["ln", 40, 46, 56], ["ln", 40, 57, 38, { o: 0.8, mv: { x: 10, y: -3 } }], ["ln", 40, 68, 48], ["fill", 136, 32, 3, 22, 1.5, { o: 0.3 }]],
  // A week view with events; one event is dragged to another time.
  scheduler: [["box", 10, 8, 130, 64, 8], ["path", "M10 20h130", { o: 0.3, w: 1 }], ["path", "M36 8v64M62 8v64M88 8v64M114 8v64", { o: 0.3, w: 1 }], ["fill", 13, 36, 20, 14, 3, { o: 0.3 }], ["fill", 65, 40, 20, 24, 3, { o: 0.85, color: "orange" }], ["fill", 91, 24, 20, 12, 3, { o: 0.3 }], ["fill", 117, 46, 20, 18, 3, { o: 0.3 }], ["fill", 39, 25, 20, 18, 3, { mv: { y: 14 } }]],
  // Task bars with progress, a dependency arrow, a milestone; the progress of a bar grows.
  gantt: [["ln", 10, 13, 22], ["ln", 10, 30, 22], ["ln", 10, 47, 22], ["ln", 10, 64, 22], ["fill", 40, 11, 36, 9, 4], ["path", "M76 15.5h4v17h4", { o: 0.6 }], ["fill", 84, 28, 40, 9, 4, { o: 0.25 }], ["fill", 84, 28, 18, 9, 4], ["fill", 84, 28, 18, 9, 4, { mv: { x: 10 } }], ["fill", 96, 45, 34, 9, 4, { o: 0.25 }], ["shape", "M134 60.5l6 6-6 6-6-6z", { color: "orange" }]],
};
