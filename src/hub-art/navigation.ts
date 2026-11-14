import type { ArtSet } from "./types.ts";

/** Drawings for the Navigation section (topics.ts › "/navigation"). */
export const art: ArtSet = {
  // A persistent layout (side links), a dashed outlet and a modal route over it.
  routing: [["box", 10, 8, 130, 64, 8], ["path", "M40 8v64", { o: 0.3, w: 1 }], ["ln", 16, 18, 18, { o: 0.7 }], ["ln", 16, 30, 18], ["ln", 16, 42, 18], ["box", 48, 16, 84, 48, 6, { dash: true, o: 0.6 }], ["box", 66, 28, 50, 28, 6, { mv: { y: -5 } }], ["ln", 74, 35, 30, { o: 0.7, mv: { y: -5 } }], ["ln", 74, 45, 20, { mv: { y: -5 } }]],
  // A menu with a section label, an active row, count badges and a starred row.
  "admin-sidebar": [["box", 32, 6, 86, 68, 8], ["ln", 42, 13, 26], ["fill", 38, 22, 74, 13, 4, { o: 0.18 }], ["ln", 44, 26, 34, { o: 0.8 }], ["fill", 94, 24, 13, 9, 4.5, { color: "orange", mv: { scale: 1.2 } }], ["ln", 44, 42, 40], ["shape", "m48 52.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.5z", { color: "gold" }], ["ln", 58, 56, 30], ["fill", 94, 54, 13, 9, 4.5, { o: 0.3 }]],
  // An icon rail, a menu column and its edge with a grip that is dragged wider.
  "resizable-sidebar": [["box", 10, 8, 130, 64, 8], ["dot", 22, 20, 4], ["dot", 22, 34, 4, { o: 0.35 }], ["dot", 22, 48, 4, { o: 0.35 }], ["path", "M34 8v64", { o: 0.3, w: 1 }], ["ln", 42, 18, 30, { o: 0.7 }], ["ln", 42, 30, 24], ["ln", 42, 42, 28], ["path", "M84 8v64", { mv: { x: 12 } }], ["fill", 81, 31, 6, 18, 3, { mv: { x: 12 } }]],
  // An open category with nested pages and a collapsed one; the active page changes.
  "nav-sidebar": [["box", 32, 6, 86, 68, 8], ["path", "m40 15 4 4 4-4"], ["ln", 54, 14.5, 36, { o: 0.7 }], ["path", "M44 24v24", { o: 0.3, w: 1 }], ["fill", 50, 36.5, 62, 12, 4, { o: 0.18, mv: { y: -12.5 } }], ["ln", 54, 27.5, 44], ["ln", 54, 40, 36, { o: 0.6 }], ["path", "m42 56 4 4-4 4"], ["ln", 54, 57.5, 30, { o: 0.7 }]],
  // Pinned pages as tiles (one with a pin) above a recently opened row.
  "nav-menu": [["box", 22, 6, 106, 68, 9], ["ln", 32, 13, 26, { o: 0.6 }], ["fill", 32, 23, 26, 18, 5, { o: 0.22 }], ["fill", 62, 23, 26, 18, 5, { o: 0.22, mv: { y: -3 } }], ["fill", 92, 23, 26, 18, 5, { o: 0.22 }], ["dot", 58, 23, 3.5, { color: "orange" }], ["path", "M22 48h106", { o: 0.3, w: 1 }], ["ring", 37, 61, 5], ["path", "M37 58v3h3", { w: 1.4 }], ["ln", 48, 58.5, 50]],
  // A tab bar with a raised middle action.
  "bottom-nav": [["box", 10, 34, 130, 34, 12], ["dot", 30, 49, 5], ["ln", 24, 58, 12, { o: 0.8 }], ["dot", 52, 51, 5, { o: 0.3 }], ["dot", 98, 51, 5, { o: 0.3 }], ["dot", 120, 51, 5, { o: 0.3 }], ["box", 62, 20, 26, 26, 13, { w: 2, mv: { y: -4 } }], ["path", "M75 27v12M69 33h12", { w: 2, mv: { y: -4 } }]],
  // Tab labels, an underline that slides to the next tab, a panel.
  tabs: [["ln", 14, 14, 22, { o: 0.8 }], ["ln", 44, 14, 22], ["ln", 74, 14, 22], ["path", "M10 27h130", { o: 0.3, w: 1 }], ["fill", 12, 25.5, 26, 3, 1.5, { mv: { x: 30 } }], ["box", 10, 34, 130, 38, 8], ["ln", 20, 44, 70], ["ln", 20, 55, 48]],
  // Step circles joined by a line: done, current, next.
  steps: [["path", "M35 32h80", { o: 0.3 }], ["path", "M35 32h31"], ["dot", 26, 32, 9], ["dot", 75, 32, 9, { mv: { scale: 1.15 } }], ["ring", 124, 32, 8], ["ln", 12, 50, 28, { o: 0.5 }], ["ln", 61, 50, 28, { o: 0.7 }], ["ln", 110, 50, 28]],
  // A step card under progress segments: content, back and next.
  stepper: [["fill", 20, 10, 34, 4, 2], ["fill", 58, 10, 34, 4, 2], ["fill", 96, 10, 34, 4, 2, { o: 0.25 }], ["box", 20, 22, 110, 50, 9], ["ln", 30, 32, 50, { o: 0.7 }], ["ln", 30, 43, 76], ["box", 30, 55, 26, 10, 5], ["fill", 94, 55, 26, 10, 5, { mv: { x: 4 } }]],
  // Arrows, page boxes with the current one filled, an ellipsis.
  pagination: [["path", "m20 34-6 6 6 6"], ["box", 28, 29, 22, 22, 6], ["box", 80, 29, 22, 22, 6], ["fill", 54, 29, 22, 22, 6, { mv: { x: 26 } }], ["dot", 109, 40, 1.8, { o: 0.5 }], ["dot", 115, 40, 1.8, { o: 0.5 }], ["dot", 121, 40, 1.8, { o: 0.5 }], ["path", "m130 34 6 6-6 6"]],
  // A phone screen: a spinner above content that is pulled down.
  "pull-to-refresh": [["box", 34, 6, 82, 68, 10], ["path", "M75 13a6 6 0 1 1-6 6", { w: 2 }], ["path", "M72 10.5l3 2.5-3 2.5", { w: 1.6 }], ["fill", 42, 30, 66, 14, 5, { o: 0.22, mv: { y: 5 } }], ["fill", 42, 48, 66, 14, 5, { o: 0.22, mv: { y: 5 } }]],
  // A truncated line with an ellipsis, and a marquee whose text slides.
  "overflow-text": [["box", 14, 14, 122, 22, 7], ["ln", 22, 22.5, 80, { o: 0.7 }], ["dot", 109, 25, 1.8], ["dot", 115, 25, 1.8], ["dot", 121, 25, 1.8], ["box", 14, 44, 122, 22, 7], ["ln", 22, 52.5, 40, { o: 0.7, mv: { x: 24 } }], ["ln", 70, 52.5, 30, { mv: { x: 24 } }]],
  // One dot per page; the active one is long.
  "page-dots": [["dot", 39, 40, 5, { o: 0.3 }], ["fill", 51, 34, 34, 12, 6, { mv: { scale: 1.1 } }], ["dot", 97, 40, 5, { o: 0.3 }], ["dot", 113, 40, 5, { o: 0.3 }]],
  // Previous and next around the period name, with a today pill.
  "period-nav": [["box", 10, 22, 28, 28, 8], ["path", "m27 30-6 6 6 6"], ["ln", 50, 33.5, 50, { o: 0.75 }], ["box", 112, 22, 28, 28, 8], ["path", "m123 30 6 6-6 6", { mv: { x: 3 } }], ["fill", 58, 56, 34, 11, 5.5, { o: 0.22 }]],
};
