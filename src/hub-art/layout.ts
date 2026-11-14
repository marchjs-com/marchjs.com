import type { ArtSet } from "./types.ts";

/** Drawings for the Layout section (topics.ts › "/layout"). */
export const art: ArtSet = {
  // A grid in a container whose width is dragged.
  "grid-live": [["box", 10, 8, 116, 64, 8, { dash: true, o: 0.6 }], ["fill", 17, 15, 31, 23, 4, { o: 0.25 }], ["fill", 52.5, 15, 31, 23, 4, { o: 0.25 }], ["fill", 88, 15, 31, 23, 4, { o: 0.25 }], ["fill", 17, 42, 31, 23, 4, { o: 0.25 }], ["fill", 52.5, 42, 31, 23, 4, { o: 0.25 }], ["fill", 130, 30, 4, 20, 2, { mv: { x: 6 } }]],
  // Five small frames, the same cards laid out in five ways.
  "grid-modes": [["box", 10, 18, 22, 38, 4], ["box", 37, 18, 22, 38, 4], ["box", 64, 18, 22, 38, 4, { w: 2.2 }], ["box", 91, 18, 22, 38, 4], ["box", 118, 18, 22, 38, 4], ["shape", "M13 22h7v8h-7zM22 22h7v8h-7zM13 33h7v8h-7zM22 33h7v8h-7zM13 44h7v8h-7zM40 22h7v8h-7zM49 22h7v8h-7zM40 33h7v8h-7zM49 33h7v8h-7zM40 44h16v8h-16zM67 22h7v8h-7zM76 22h7v8h-7zM67 33h7v8h-7zM76 33h7v8h-7zM71.5 44h7v8h-7zM94 22h16v8h-16zM94 33h7v8h-7zM103 33h7v8h-7zM94 44h7v8h-7zM103 44h7v8h-7zM121 22h7v14h-7zM121 38h7v8h-7zM130 22h7v8h-7zM130 32h7v14h-7z", { o: 0.45 }], ["ln", 64, 62, 22, { o: 0.7 }]],
  // Three columns; the short last row moves to the centre.
  grid: [["fill", 14, 10, 38, 27, 5, { o: 0.25 }], ["fill", 56, 10, 38, 27, 5, { o: 0.25 }], ["fill", 98, 10, 38, 27, 5, { o: 0.25 }], ["fill", 14, 43, 38, 27, 5, { o: 0.5, mv: { x: 21 } }], ["fill", 56, 43, 38, 27, 5, { o: 0.5, mv: { x: 21 } }]],
  // A toolbar with a divider on top, a row of stacked items with gaps below.
  stack: [["box", 10, 10, 130, 24, 8], ["fill", 16, 16, 12, 12, 3, { o: 0.3 }], ["fill", 32, 16, 12, 12, 3, { o: 0.3 }], ["path", "M50 15v14", { o: 0.4 }], ["fill", 56, 16, 12, 12, 3, { o: 0.3 }], ["fill", 112, 16, 22, 12, 4], ["fill", 10, 44, 36, 24, 5, { o: 0.22 }], ["fill", 50, 44, 36, 24, 5, { o: 0.22 }], ["fill", 90, 44, 36, 24, 5, { o: 0.22, mv: { x: 6 } }]],
  // A row: the spacer (dashed arrow) pushes the last item to the end.
  spacer: [["box", 10, 26, 130, 28, 8], ["fill", 16, 32, 26, 16, 4, { o: 0.3 }], ["path", "M52 40h40", { dash: true, o: 0.6 }], ["path", "m54 36-4 4 4 4M90 36l4 4-4 4", { o: 0.6 }], ["fill", 100, 32, 26, 16, 4, { mv: { x: 8 } }]],
  // Two panes and a divider with a grip that is dragged.
  splitter: [["box", 10, 8, 130, 64, 8], ["ln", 18, 18, 36], ["ln", 18, 28, 26], ["ln", 78, 18, 50], ["ln", 78, 28, 36], ["ln", 78, 38, 44], ["path", "M66 8v64", { mv: { x: -8 } }], ["fill", 63, 30, 6, 20, 3, { mv: { x: -8 } }]],
  // Three sections, the middle one open; its body folds.
  accordion: [["box", 14, 6, 122, 14, 5], ["ln", 22, 10.5, 40, { o: 0.7 }], ["path", "m120 11 4 4 4-4", { o: 0.6 }], ["box", 14, 24, 122, 32, 5], ["ln", 22, 29, 46, { o: 0.7 }], ["path", "m120 33 4-4 4 4"], ["ln", 22, 40, 90, { mv: { opacity: 0 } }], ["ln", 22, 48, 60, { mv: { opacity: 0 } }], ["box", 14, 60, 122, 14, 5], ["ln", 22, 64.5, 34, { o: 0.7 }], ["path", "m120 65 4 4 4-4", { o: 0.6 }]],
  // A summary with its triangle and the revealed content.
  disclosure: [["shape", "M14 17h11l-5.5 8z"], ["ln", 33, 18.5, 52, { o: 0.75 }], ["path", "M19.5 32v28", { o: 0.3, w: 1 }], ["ln", 33, 34, 90, { mv: { y: 4 } }], ["ln", 33, 44, 70, { mv: { y: 4 } }], ["ln", 33, 54, 80, { mv: { y: 4 } }]],
  // The page frame: header, side column, content, footer.
  layout: [["box", 10, 6, 130, 68, 8], ["fill", 10, 6, 130, 12, 8, { o: 0.22, mv: { opacity: 0.5 } }], ["fill", 10, 18, 28, 44, 0, { o: 0.1 }], ["fill", 10, 62, 130, 12, 8, { o: 0.12 }], ["path", "M10 18h130M38 18v44M10 62h130", { o: 0.3, w: 1 }], ["ln", 46, 26, 60, { o: 0.6 }], ["ln", 46, 36, 80], ["ln", 46, 46, 50]],
  // A page with controls lined up in one corner; the other corners are free slots.
  "bottom-right-controls": [["box", 10, 6, 130, 68, 8], ["ln", 20, 16, 50], ["ln", 20, 26, 70], ["ring", 24, 60, 6, { dash: true, o: 0.4 }], ["ring", 126, 20, 6, { dash: true, o: 0.4 }], ["dot", 108, 60, 7, { o: 0.45 }], ["dot", 126, 60, 7, { mv: { scale: 1.15 } }]],
  // A box inside the page: its drawer, dialog and toast stay inside it.
  "overlay-scope": [["box", 8, 6, 134, 68, 8, { dash: true, o: 0.4 }], ["ln", 14, 18, 18], ["ln", 14, 28, 14], ["box", 40, 14, 94, 52, 8], ["fill", 40, 14, 28, 52, 8, { o: 0.2 }], ["box", 80, 26, 44, 24, 5, { mv: { y: -3 } }], ["ln", 87, 33, 28, { o: 0.6, mv: { y: -3 } }], ["fill", 98, 56, 30, 6, 3]],
  // A floating window with a title bar, dragged across its area.
  window: [["box", 8, 6, 134, 68, 6, { dash: true, o: 0.35 }], ["box", 26, 16, 84, 50, 8, { mv: { x: 12, y: -4 } }], ["fill", 26, 16, 84, 13, 8, { o: 0.18, mv: { x: 12, y: -4 } }], ["ln", 34, 20, 30, { o: 0.7, mv: { x: 12, y: -4 } }], ["dot", 92, 22.5, 2.2, { o: 0.6, mv: { x: 12, y: -4 } }], ["dot", 99, 22.5, 2.2, { o: 0.6, mv: { x: 12, y: -4 } }], ["ln", 34, 38, 50, { mv: { x: 12, y: -4 } }], ["ln", 34, 48, 34, { mv: { x: 12, y: -4 } }]],
  // A phone frame with a notch beside a tablet frame, and the rotate arrow.
  "device-preview": [["box", 14, 18, 34, 46, 6, { o: 0.45 }], ["box", 54, 6, 44, 68, 10], ["fill", 68, 10, 16, 4, 2], ["fill", 60, 20, 32, 16, 4, { o: 0.2 }], ["ln", 60, 42, 26], ["ln", 60, 51, 18], ["ln", 68, 65, 16, { o: 0.5 }], ["path", "M112 33a10 10 0 1 1-1 13", { w: 2, mv: { rotate: 20 } }], ["path", "M112 26v7h7", { w: 2, mv: { rotate: 20 } }]],
  // A side column, a top announcement and a main area that scrolls.
  "app-shell": [["box", 10, 6, 130, 68, 8], ["fill", 10, 6, 34, 68, 8, { o: 0.15 }], ["ln", 16, 16, 20, { o: 0.7 }], ["ln", 16, 27, 20], ["ln", 16, 38, 20], ["fill", 50, 12, 84, 9, 4, { o: 0.35, color: "orange" }], ["ln", 50, 31, 70, { o: 0.6, mv: { y: -5 } }], ["ln", 50, 41, 80, { mv: { y: -5 } }], ["ln", 50, 51, 60, { mv: { y: -5 } }], ["ln", 50, 61, 74, { mv: { y: -5 } }]],
  // The top bar of a panel: icon, title and subtitle, a count, the close button.
  "panel-header": [["path", "M10 40v26a8 8 0 0 0 8 8h114a8 8 0 0 0 8-8V40", { dash: true, o: 0.35 }], ["box", 10, 12, 130, 30, 9], ["fill", 18, 18, 18, 18, 5, { o: 0.25 }], ["ln", 44, 20, 38, { o: 0.75 }], ["ln", 44, 30, 26], ["fill", 88, 19, 15, 9, 4.5, { o: 0.25 }], ["path", "M121 22l10 10m0-10-10 10", { w: 2, mv: { scale: 1.2 } }]],
  // A panel with a grip on its edge (dragged) and one in its corner.
  "resize-handle": [["box", 16, 10, 100, 56, 8], ["ln", 26, 20, 40, { o: 0.6 }], ["ln", 26, 30, 60], ["path", "M110 62l2-2M103 62l9-9M96 62l16-16", { o: 0.6, w: 1.4 }], ["fill", 119, 28, 5, 20, 2.5, { mv: { x: 8 } }]],
};
