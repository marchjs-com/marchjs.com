import type { ArtSet } from "./types.ts";

/** Drawings for the Themes section (topics.ts › "/themes"). */
export const art: ArtSet = {
  // Three small cards, each in its own theme colour.
  presets: [["box", 10, 14, 38, 52, 7], ["fill", 16, 20, 26, 8, 3], ["ln", 16, 35, 20], ["fill", 16, 50, 18, 8, 4], ["box", 56, 14, 38, 52, 7, { color: "orange", mv: { y: -4 } }], ["fill", 62, 20, 26, 8, 3, { color: "orange", mv: { y: -4 } }], ["ln", 62, 35, 20, { color: "orange", mv: { y: -4 } }], ["fill", 62, 50, 18, 8, 4, { color: "orange", mv: { y: -4 } }], ["box", 102, 14, 38, 52, 7, { color: "purple" }], ["fill", 108, 20, 26, 8, 3, { color: "purple" }], ["ln", 108, 35, 20, { color: "purple" }], ["fill", 108, 50, 18, 8, 4, { color: "purple" }]],
  // A trigger and its menu: the light / dark / system switch over a row of colour swatches.
  "theme-menu": [["box", 96, 6, 40, 16, 8], ["dot", 106, 14, 4], ["ln", 114, 11.5, 14], ["box", 30, 26, 106, 48, 8], ["fill", 36, 32, 94, 13, 5, { o: 0.12 }], ["fill", 38, 34, 30, 9, 4, { o: 0.6, mv: { x: 30 } }], ["ring", 46, 59, 9], ["dot", 46, 59, 5.5], ["dot", 68, 59, 5.5, { color: "orange" }], ["dot", 88, 59, 5.5, { color: "purple" }], ["dot", 108, 59, 5.5, { o: 0.3 }]],
  // Controls on the left (colours, a radius slider), a live preview on the right.
  "theme-editor": [["box", 10, 8, 130, 64, 8], ["path", "M70 8v64", { o: 0.3, w: 1 }], ["dot", 23, 20, 5], ["ln", 33, 17.5, 28], ["dot", 23, 34, 5, { color: "orange" }], ["ln", 33, 31.5, 22], ["fill", 18, 50, 44, 4, 2, { o: 0.25 }], ["box", 34, 46, 12, 12, 6, { w: 2.2, mv: { x: 10 } }], ["box", 80, 18, 50, 44, 7], ["fill", 87, 25, 24, 8, 3], ["ln", 87, 39, 34], ["fill", 87, 49, 20, 8, 4, { color: "orange" }]],
  // The four brand colours as swatches with their names.
  "brand-colors": [["fill", 14, 14, 26, 38, 8, { color: "orange" }], ["fill", 46, 14, 26, 38, 8, { color: "blue", mv: { y: -4 } }], ["fill", 78, 14, 26, 38, 8, { color: "green" }], ["fill", 110, 14, 26, 38, 8, { color: "purple" }], ["ln", 14, 60, 18], ["ln", 46, 60, 18], ["ln", 78, 60, 18], ["ln", 110, 60, 18]],
  // Semantic tokens: a swatch and its name, in two columns.
  "color-tokens": [["fill", 14, 10, 16, 16, 4], ["ln", 38, 15.5, 30], ["box", 14, 32, 16, 16, 4], ["ln", 38, 37.5, 22], ["fill", 14, 54, 16, 16, 4, { o: 0.3 }], ["ln", 38, 59.5, 26], ["fill", 82, 10, 16, 16, 4, { color: "green", mv: { scale: 1.15 } }], ["ln", 106, 15.5, 26], ["fill", 82, 32, 16, 16, 4, { color: "orange" }], ["ln", 106, 37.5, 30], ["fill", 82, 54, 16, 16, 4, { o: 0.12 }], ["ln", 106, 59.5, 20]],
  // Eight categorical colours in a row.
  palette: [["dot", 17, 40, 7], ["dot", 33.5, 40, 7, { color: "orange" }], ["dot", 50, 40, 7, { color: "blue", mv: { y: -6 } }], ["dot", 66.5, 40, 7, { color: "green" }], ["dot", 83, 40, 7, { color: "purple" }], ["dot", 99.5, 40, 7, { color: "pink" }], ["dot", 116, 40, 7, { color: "gold" }], ["dot", 132.5, 40, 7, { o: 0.4 }]],
  // Lines of text from the largest heading down to body text.
  "type-scale": [["fill", 14, 9, 92, 13, 3, { o: 0.85, mv: { x: 5 } }], ["fill", 14, 28, 70, 9, 3, { o: 0.6 }], ["fill", 14, 43, 100, 6, 3, { o: 0.45 }], ["ln", 14, 55, 80], ["ln", 14, 65, 54]],
  // Three boxes: the radius grows, and so does the shadow under each.
  "radius-elevation": [["fill", 15, 20, 30, 30, 2, { o: 0.15 }], ["box", 14, 18, 30, 30, 2], ["fill", 61, 22, 30, 30, 8, { o: 0.15 }], ["box", 58, 18, 30, 30, 8], ["fill", 107, 25, 30, 30, 15, { o: 0.15 }], ["box", 102, 18, 30, 30, 15, { mv: { y: -4 } }], ["ln", 18, 62, 22], ["ln", 62, 62, 22], ["ln", 106, 62, 22]],
};
