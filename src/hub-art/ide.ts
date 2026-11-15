import type { ArtSet } from "./types.ts";

/** Drawings for the IDE shell section (topics.ts › "/ide"). */
export const art: ArtSet = {
  // A small editor: activity bar, file tree, tabbed code, status line.
  "live": [["box", 10, 6, 130, 68, 7], ["dot", 17, 16, 2.500], ["dot", 17, 26, 2.500, { o: 0.4 }], ["dot", 17, 36, 2.500, { o: 0.4 }], ["path", "M24 7v58", { o: 0.4 }], ["ln", 29, 14, 20], ["ln", 33, 23, 16], ["path", "M56 7v58", { o: 0.4 }], ["fill", 60, 10, 24, 8, 3, { o: 0.3 }], ["ln", 88, 11.500, 18, { o: 0.2 }], ["ln", 62, 26, 40, { o: 0.6 }], ["ln", 68, 35, 54], ["ln", 62, 44, 20], ["fill", 86, 42.500, 2, 8, 1, { mv: { opacity: 0 } }], ["path", "M11 65h128", { o: 0.4 }]],
  // Split panels; a dragged tab drops on a highlighted edge zone.
  "app-ui": [["fill", 10, 6, 130, 8, 3, { o: 0.25 }], ["box", 10, 18, 10, 54, 3], ["box", 24, 18, 44, 54, 5], ["ln", 30, 23, 16, { o: 0.7 }], ["box", 72, 18, 68, 30, 5], ["ln", 78, 23, 18, { o: 0.5 }], ["box", 72, 52, 68, 20, 5], ["fill", 116, 8, 22, 4, 2, { o: 0.6 }]],
  "dock-layout": [["box", 10, 8, 64, 64, 6], ["ln", 16, 13, 20, { o: 0.7 }], ["ln", 40, 13, 16, { o: 0.25 }], ["box", 78, 8, 62, 30, 6], ["ln", 84, 13, 18, { o: 0.5 }], ["box", 78, 42, 62, 30, 6], ["ln", 84, 47, 18, { o: 0.5 }], ["fill", 110, 44, 28, 26, 4, { o: 0.2 }], ["fill", 90, 26, 26, 10, 4, { mv: { x: 10, y: 12 } }]],
  // A group header, then label and value rows with different editors.
  "property-grid": [["path", "M14 12l4 4 4-4"], ["ln", 26, 11.500, 36, { o: 0.7 }], ["ln", 14, 29.500, 34], ["box", 64, 26, 72, 12, 4], ["ln", 70, 29.500, 30, { o: 0.6 }], ["ln", 14, 45.500, 26], ["box", 64, 42, 72, 12, 4], ["fill", 68, 45, 6, 6, 2, { color: "orange" }], ["ln", 78, 45.500, 24, { o: 0.6 }], ["ln", 14, 61.500, 30], ["box", 64, 58, 22, 12, 6], ["dot", 80, 64, 3.500, { mv: { x: -10 } }]],
  // A toolbar whose last item moves into the "more" menu.
  "overflow-toolbar": [["box", 10, 12, 130, 24, 8], ["fill", 16, 17, 14, 14, 4, { o: 0.5 }], ["fill", 34, 17, 14, 14, 4, { o: 0.5 }], ["fill", 52, 17, 14, 14, 4, { o: 0.5 }], ["fill", 70, 17, 14, 14, 4, { o: 0.5, mv: { x: 12, opacity: 0.15 } }], ["dot", 118, 24, 1.800], ["dot", 124, 24, 1.800], ["dot", 130, 24, 1.800], ["box", 92, 40, 48, 32, 6], ["ln", 99, 47, 30, { o: 0.6 }], ["ln", 99, 58, 22]],
  // A window with a bar at the bottom: items at the start and at the end.
  "status-bar": [["box", 10, 8, 130, 64, 8], ["ln", 20, 18, 60, { o: 0.2 }], ["ln", 20, 29, 80, { o: 0.2 }], ["ln", 20, 40, 44, { o: 0.2 }], ["fill", 10, 54, 130, 18, 8, { o: 0.2 }], ["dot", 20, 63, 3, { color: "green", mv: { scale: 1.2 } }], ["ln", 28, 60.500, 22, { o: 0.7 }], ["ln", 56, 60.500, 16], ["ln", 96, 60.500, 14], ["ln", 114, 60.500, 18, { o: 0.7 }]],
  // A vertical icon bar; the indicator slides to the active icon.
  "activity-bar": [["box", 30, 6, 30, 68, 8], ["fill", 39, 14, 12, 12, 3], ["fill", 39, 34, 12, 12, 3, { o: 0.3 }], ["fill", 39, 54, 12, 12, 3, { o: 0.3 }], ["fill", 33, 13, 3, 14, 1.500, { mv: { y: 20 } }], ["box", 64, 6, 56, 68, 8, { o: 0.6 }], ["ln", 72, 16, 30, { o: 0.6 }], ["ln", 72, 28, 40], ["ln", 72, 38, 34], ["ln", 72, 48, 38]],
  // Path segments with chevrons; the last one opens a menu of siblings.
  "breadcrumbs": [["ln", 10, 24, 22], ["path", "M38 22l4 4.500-4 4.500"], ["ln", 48, 24, 26], ["path", "M80 22l4 4.500-4 4.500"], ["fill", 90, 19, 44, 15, 5, { o: 0.2 }], ["ln", 96, 24, 32, { o: 0.8 }], ["box", 90, 38, 50, 30, 6, { mv: { y: 3 } }], ["ln", 97, 45, 30, { o: 0.6, mv: { y: 3 } }], ["ln", 97, 55, 24, { mv: { y: 3 } }]],
};
