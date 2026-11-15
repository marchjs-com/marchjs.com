import type { ArtSet } from "./types.ts";

/** Drawings for the Language section (topics.ts › "/language"). */
export const art: ArtSet = {
  // An input with an add button, a done item (struck through) and an open one.
  "todos": [["box", 14, 8, 94, 16, 6], ["ln", 20, 13.500, 40], ["fill", 112, 8, 24, 16, 6], ["fill", 14, 32, 12, 12, 4, { o: 0.25 }], ["path", "m17 38 2.500 2.500 4.500-5", { mv: { scale: 1.2 } }], ["ln", 32, 35.500, 60, { o: 0.2 }], ["path", "M30 38h64", { o: 0.5 }], ["box", 14, 52, 12, 12, 4], ["ln", 32, 55.500, 74, { o: 0.6 }]],
  // A raw value, the pipe bar, a pipe, and the formatted result.
  "pipes": [["ln", 12, 37.500, 30, { o: 0.7 }], ["path", "M51 26v28", { w: 2.4 }], ["box", 60, 29, 34, 22, 11], ["path", "M68 40h18m-5-5 5 5-5 5"], ["fill", 102, 30, 36, 20, 6, { o: 0.2, color: "orange" }], ["ln", 109, 37.500, 22, { o: 0.8, color: "orange", mv: { x: 4 } }]],
  // A styled element and its class chips; one class is toggled.
  "sx-class": [["fill", 14, 22, 44, 36, 10, { o: 0.85 }], ["box", 70, 12, 36, 14, 7], ["ln", 77, 16.500, 22, { o: 0.7 }], ["box", 110, 12, 30, 14, 7], ["ln", 117, 16.500, 16, { o: 0.7 }], ["box", 70, 32, 46, 14, 7], ["ln", 77, 36.500, 32, { o: 0.7 }], ["box", 70, 52, 34, 14, 7, { dash: true, o: 0.6, mv: { scale: 1.1 } }], ["ln", 77, 56.500, 20, { o: 0.3, mv: { scale: 1.1 } }]],
  // Text whose selection is switched off.
  "common-props": [["box", 14, 10, 122, 60, 8], ["fill", 22, 30, 62, 9, 2, { o: 0.25, color: "blue", mv: { opacity: 0 } }], ["ln", 24, 20, 80, { o: 0.6 }], ["ln", 24, 32, 96], ["ln", 24, 44, 60], ["path", "M96 50v14m-3-14h6m-6 14h6"], ["ring", 118, 56, 8, { color: "orange" }], ["path", "M112.500 50.500l11 11", { color: "orange" }]],
  // A component box with a plug-in piece docking to its side and a new prop chip.
  "extensions": [["box", 14, 14, 74, 52, 8], ["ln", 24, 26, 40, { o: 0.7 }], ["ln", 24, 38, 54], ["ln", 24, 50, 30, { o: 0.6 }], ["fill", 98, 26, 38, 28, 7, { o: 0.3, color: "orange", mv: { x: -6 } }], ["path", "M88 40h10", { color: "orange" }], ["ring", 117, 40, 5, { color: "orange" }]],
  // Preview and Code tabs over a code panel.
  "code-widget": [["ln", 16, 11, 26], ["fill", 48, 8, 36, 11, 5, { o: 0.2 }], ["ln", 53, 11, 26, { o: 0.8 }], ["box", 10, 22, 130, 52, 8], ["ln", 22, 31, 40, { o: 0.7 }], ["ln", 30, 41, 60, { o: 0.6, color: "orange", mv: { x: 4 } }], ["ln", 30, 51, 44], ["ln", 22, 61, 24, { o: 0.7 }], ["box", 122, 28, 10, 10, 2]],
};
