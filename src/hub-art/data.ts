import type { ArtSet } from "./types.ts";

/** Drawings for the Data section (topics.ts › "/data"). */
export const art: ArtSet = {
  // A table: tinted header, rows of cells; the row highlight steps down a row.
  table: [["box", 10, 8, 130, 64, 8], ["fill", 10, 8, 130, 15, 8, { o: 0.16 }], ["ln", 18, 13, 24, { o: 0.7 }], ["ln", 62, 13, 24, { o: 0.7 }], ["ln", 106, 13, 24, { o: 0.7 }], ["fill", 13, 27, 124, 13, 3, { o: 0.14, mv: { y: 16 } }], ["ln", 18, 31, 30], ["ln", 62, 31, 18], ["ln", 106, 31, 22], ["ln", 18, 47, 22], ["ln", 62, 47, 26], ["ln", 106, 47, 16]],
  // An expanded branch with two children and a collapsed sibling; the focus bar moves with the arrow keys.
  tree: [["fill", 28, 24, 96, 14, 4, { o: 0.14, mv: { y: 15 } }], ["path", "m13 14 5 5 5-5"], ["ln", 32, 13, 48, { o: 0.7 }], ["path", "M18 25v27", { o: 0.3, w: 1 }], ["dot", 36, 31, 2.5, { o: 0.5 }], ["ln", 44, 28.5, 56], ["dot", 36, 46, 2.5, { o: 0.5 }], ["ln", 44, 43.5, 40], ["path", "m15 57 5 5-5 5"], ["ln", 32, 59.5, 60, { o: 0.7 }]],
  // Three columns of cards; one card is being dragged to the next column.
  kanban: [["box", 10, 8, 40, 64, 7], ["box", 55, 8, 40, 64, 7], ["box", 100, 8, 40, 64, 7], ["ln", 16, 14, 18, { o: 0.6 }], ["ln", 61, 14, 18, { o: 0.6 }], ["ln", 106, 14, 18, { o: 0.6 }], ["fill", 15, 24, 30, 12, 3, { o: 0.25 }], ["fill", 60, 24, 30, 12, 3, { o: 0.25 }], ["fill", 105, 24, 30, 12, 3, { o: 0.25 }], ["fill", 105, 40, 30, 12, 3, { o: 0.25 }], ["fill", 15, 40, 30, 12, 3, { mv: { x: 24, y: 4 } }]],
  // Events on a vertical line with toned dots.
  timeline: [["path", "M28 16v48", { o: 0.3 }], ["dot", 28, 16, 5], ["ln", 42, 11, 56, { o: 0.7 }], ["ln", 42, 20, 34], ["dot", 28, 40, 5, { color: "green", mv: { scale: 1.2 } }], ["ln", 42, 35, 46, { o: 0.7 }], ["ln", 42, 44, 70], ["dot", 28, 64, 5, { color: "orange" }], ["ln", 42, 59, 40, { o: 0.7 }], ["ln", 42, 68, 60]],
  // Label over value, two columns.
  "key-value": [["ln", 18, 11, 22], ["ln", 18, 20, 42, { o: 0.75 }], ["ln", 84, 11, 26], ["ln", 84, 20, 34, { o: 0.75 }], ["ln", 18, 34, 28], ["ln", 18, 43, 34, { o: 0.75 }], ["ln", 84, 34, 20], ["ln", 84, 43, 46, { o: 0.75, mv: { x: 6 } }], ["ln", 18, 57, 20], ["ln", 18, 66, 46, { o: 0.75 }], ["ln", 84, 57, 24], ["ln", 84, 66, 30, { o: 0.75 }]],
  // A brace, keys and typed values; the nested rows fold away.
  "json-view": [["path", "M24 12c-5 0-7 2-7 7v14c0 4-2 6-5 7 3 1 5 3 5 7v14c0 5 2 7 7 7"], ["ln", 34, 16, 22, { o: 0.7 }], ["ln", 62, 16, 34, { o: 0.8, color: "green" }], ["path", "m33 31 4 4 4-4"], ["ln", 46, 30, 26, { o: 0.7 }], ["ln", 54, 44, 18, { o: 0.7, mv: { opacity: 0 } }], ["ln", 78, 44, 40, { o: 0.8, color: "green", mv: { opacity: 0 } }], ["ln", 54, 58, 28, { o: 0.7, mv: { opacity: 0 } }], ["ln", 88, 58, 14, { o: 0.8, color: "orange", mv: { opacity: 0 } }]],
  // Read-only code: a gutter of line numbers, coloured tokens; the line highlight steps down.
  "code-view": [["box", 10, 8, 130, 64, 8], ["path", "M34 8v64", { o: 0.3, w: 1 }], ["fill", 35, 26, 104, 11, 0, { o: 0.12, mv: { y: 13 } }], ["ln", 17, 16, 10], ["ln", 17, 29, 10], ["ln", 17, 42, 10], ["ln", 17, 55, 10], ["ln", 42, 16, 28, { o: 0.8, color: "purple" }], ["ln", 74, 16, 40, { o: 0.5 }], ["ln", 50, 29, 52, { o: 0.5 }], ["ln", 50, 42, 30, { o: 0.8, color: "green" }], ["ln", 42, 55, 16, { o: 0.5 }]],
  // Title with actions, body, footer with a button.
  card: [["box", 14, 8, 122, 64, 10], ["ln", 24, 17, 44, { o: 0.7 }], ["dot", 112, 19.5, 1.8, { o: 0.5 }], ["dot", 119, 19.5, 1.8, { o: 0.5 }], ["dot", 126, 19.5, 1.8, { o: 0.5 }], ["ln", 24, 31, 90], ["ln", 24, 41, 66], ["path", "M14 53h122", { o: 0.3, w: 1 }], ["ln", 24, 60, 30], ["fill", 98, 58, 28, 9, 4, { mv: { scale: 1.12 } }]],
  // Status pills and a count on a corner.
  badge: [["fill", 14, 12, 58, 20, 10, { o: 0.2 }], ["dot", 26, 22, 3], ["ln", 34, 19.5, 28, { o: 0.8 }], ["fill", 78, 12, 58, 20, 10, { o: 0.2, color: "green" }], ["dot", 90, 22, 3, { color: "green" }], ["ln", 98, 19.5, 28, { o: 0.8, color: "green" }], ["box", 36, 44, 26, 24, 7], ["dot", 62, 45, 7, { color: "orange", mv: { scale: 1.2 } }], ["fill", 84, 47, 44, 18, 9]],
  // One row: round icon, title and subtitle, a trailing slot.
  "list-row": [["box", 10, 22, 130, 36, 9], ["dot", 30, 40, 10, { o: 0.25 }], ["ln", 48, 32, 46, { o: 0.7 }], ["ln", 48, 43, 30], ["fill", 106, 34, 24, 12, 6, { o: 0.25 }], ["dot", 124, 40, 4, { mv: { x: -12 } }]],
  // Label, a big value, a rising trend.
  "stat-tile": [["box", 20, 10, 110, 60, 10], ["ln", 30, 20, 34], ["fill", 30, 32, 46, 14, 4, { o: 0.85, mv: { y: -3 } }], ["ln", 30, 54, 24, { o: 0.8, color: "green" }], ["path", "M96 52l8-8 6 5 10-12", { color: "green", w: 2 }], ["path", "M113 37h7v7", { color: "green", w: 2 }]],
  // A split panel with a draggable divider, beside a scrolling gallery.
  panels: [["box", 10, 10, 62, 60, 8], ["ln", 17, 20, 16], ["ln", 17, 30, 12], ["path", "M38 10v60", { mv: { x: 8 } }], ["fill", 36, 33, 4, 14, 2, { mv: { x: 8 } }], ["ln", 52, 20, 12], ["fill", 82, 14, 34, 42, 6, { o: 0.22 }], ["fill", 120, 14, 20, 42, 6, { o: 0.12 }], ["fill", 96, 63, 12, 5, 2.5], ["dot", 114, 65.5, 2.5, { o: 0.3 }], ["dot", 122, 65.5, 2.5, { o: 0.3 }]],
  // Three tinted squares, each with an icon.
  "icon-tile": [["fill", 14, 24, 32, 32, 9, { o: 0.2 }], ["path", "m23 40 5 5 9-10", { w: 2.2 }], ["fill", 59, 24, 32, 32, 9, { o: 0.22, color: "orange", mv: { y: -5 } }], ["path", "M77 31l-8 11h8l-2 7 8-11h-8z", { color: "orange", w: 1.8, mv: { y: -5 } }], ["fill", 104, 24, 32, 32, 9, { o: 0.22, color: "green" }], ["ring", 120, 40, 6, { color: "green", w: 2.2 }]],
  // A card that is a link: icon tile, title, description and an arrow that slides on hover.
  "link-card": [["box", 24, 8, 102, 64, 10], ["fill", 34, 17, 20, 20, 6, { o: 0.22 }], ["ln", 34, 46, 50, { o: 0.7 }], ["ln", 34, 57, 72], ["path", "M102 27h12m-5-5 5 5-5 5", { w: 2, mv: { x: 5 } }]],
  // Ticks with labels and a playhead.
  "time-ruler": [["path", "M10 54h130", { o: 0.5 }], ["path", "M10 44v10M36 44v10M62 44v10M88 44v10M114 44v10M140 44v10", { o: 0.6 }], ["path", "M23 49v5M49 49v5M75 49v5M101 49v5M127 49v5", { o: 0.35, w: 1.2 }], ["ln", 30, 34, 12], ["ln", 82, 34, 12], ["ln", 108, 34, 12], ["path", "M62 22v42", { color: "orange", w: 2, mv: { x: 18 } }], ["shape", "M56 14h12v5l-6 6-6-6z", { color: "orange", mv: { x: 18 } }]],
};
