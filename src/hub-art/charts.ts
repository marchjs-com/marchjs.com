import type { ArtSet } from "./types.ts";

/** Drawings for the Charts section (topics.ts › "/charts"). */
export const art: ArtSet = {
  // A stat: label, value, change pill and a trend line.
  stat: [["box", 14, 10, 122, 60, 10], ["ln", 24, 19, 30], ["fill", 24, 31, 40, 13, 4, { o: 0.85 }], ["fill", 24, 52, 26, 10, 5, { o: 0.3, color: "green" }], ["path", "M76 54l10-8 9 4 10-14 9 6 10-12", { w: 2 }], ["dot", 124, 30, 3.5, { mv: { scale: 1.2 } }]],
  // Two series, one with an area; a focused point.
  "line-chart": [["path", "M14 10v58h124", { o: 0.35 }], ["shape", "M14 56l22-14 20 8 24-22 22 10 28-18v48H14z", { o: 0.15 }], ["path", "M14 56l22-14 20 8 24-22 22 10 28-18", { w: 2 }], ["path", "M14 62l22-4 20-6 24 4 22-10 28 2", { w: 2, color: "orange" }], ["dot", 80, 28, 4, { mv: { scale: 1.2 } }]],
  // Grouped bars; the second series fades back.
  "bar-chart": [["path", "M12 68h126", { o: 0.35 }], ["fill", 20, 38, 10, 30, 2], ["fill", 32, 48, 10, 20, 2, { color: "orange", mv: { opacity: 0.3 } }], ["fill", 52, 26, 10, 42, 2], ["fill", 64, 40, 10, 28, 2, { color: "orange", mv: { opacity: 0.3 } }], ["fill", 84, 44, 10, 24, 2], ["fill", 96, 30, 10, 38, 2, { color: "orange", mv: { opacity: 0.3 } }], ["fill", 116, 14, 10, 54, 2], ["fill", 128, 34, 10, 34, 2, { color: "orange", mv: { opacity: 0.3 } }]],
  // A donut with the total in the middle and a legend; one slice steps out.
  "pie-chart": [["path", "M55 14.5A26 26 0 0 1 67.1 59.6", { w: 8, mv: { x: 4, y: -1 } }], ["path", "M58.5 64.6A26 26 0 0 1 27.7 53.4", { w: 8, color: "orange" }], ["path", "M24.3 44.1A26 26 0 0 1 45 14.5", { w: 8, color: "blue" }], ["ln", 40, 37.5, 20, { o: 0.7 }], ["dot", 98, 26, 3], ["ln", 106, 23.5, 28], ["dot", 98, 40, 3, { color: "orange" }], ["ln", 106, 37.5, 22], ["dot", 98, 54, 3, { color: "blue" }], ["ln", 106, 51.5, 26]],
  // Ranked horizontal bars; the middle bar grows.
  "bar-list": [["fill", 14, 14, 122, 10, 5, { o: 0.15 }], ["fill", 14, 14, 104, 10, 5], ["fill", 14, 34, 122, 10, 5, { o: 0.15 }], ["fill", 14, 34, 52, 10, 5], ["fill", 14, 34, 52, 10, 5, { mv: { x: 30 } }], ["fill", 14, 54, 122, 10, 5, { o: 0.15 }], ["fill", 14, 54, 36, 10, 5]],
  // A score ring filling up, with the number in the middle.
  "progress-ring": [["ring", 75, 40, 26, { o: 0.2, w: 8 }], ["path", "M75 14A26 26 0 1 1 52.5 53", { w: 8, mv: { opacity: 0.6 } }], ["ln", 66, 40, 18, { o: 0.8 }]],
  // Three rows, each with a small trend line and its last point.
  sparkline: [["ln", 14, 18, 22], ["path", "M50 22l12-6 10 3 12-8 12 5 14-6", { w: 2 }], ["dot", 110, 10, 3, { mv: { scale: 1.3 } }], ["ln", 14, 40, 26], ["path", "M50 42l12 2 10-8 12 4 12-10 14 3", { w: 2, color: "orange" }], ["ln", 14, 62, 18], ["path", "M50 60l12-3 10 5 12-2 12-6 14-2", { w: 2, color: "blue" }], ["ln", 124, 18, 12, { o: 0.6 }], ["ln", 124, 40, 12, { o: 0.6 }], ["ln", 124, 62, 12, { o: 0.6 }]],
  // Day × hour cells in tones of the accent; the hottest cell pops.
  heatmap: [["shape", "M10 10h16v13h-16zM29 10h16v13h-16zM105 10h16v13h-16zM124 10h16v13h-16zM10 26h16v13h-16zM124 26h16v13h-16zM105 42h16v13h-16zM124 42h16v13h-16zM10 58h16v13h-16zM29 58h16v13h-16zM86 58h16v13h-16zM105 58h16v13h-16z", { o: 0.15 }], ["shape", "M48 10h16v13h-16zM86 10h16v13h-16zM29 26h16v13h-16zM105 26h16v13h-16zM10 42h16v13h-16zM29 42h16v13h-16zM86 42h16v13h-16zM48 58h16v13h-16zM67 58h16v13h-16zM124 58h16v13h-16z", { o: 0.4 }], ["shape", "M67 10h16v13h-16zM48 26h16v13h-16zM86 26h16v13h-16zM48 42h16v13h-16zM67 42h16v13h-16z", { o: 0.7 }], ["fill", 67, 26, 16, 13, 0, { mv: { scale: 1.2 } }]],
};
