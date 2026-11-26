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
  // A dial: the scale arc, a red zone, the needle swinging up.
  gauge: [["path", "M43 62A36 36 0 1 1 107 62", { o: 0.3, w: 6 }], ["path", "M100 20A36 36 0 0 1 107 62", { w: 6, color: "orange" }], ["path", "M75 44L52 26", { w: 3, mv: { rotate: 60 } }], ["dot", 75, 44, 5]],
  // Four drums in a frame; the last one (the fraction) red, rolling.
  odometer: [["box", 22, 22, 106, 34, 6], ["fill", 30, 28, 18, 22, 3, { o: 0.8 }], ["fill", 52, 28, 18, 22, 3, { o: 0.8 }], ["fill", 74, 28, 18, 22, 3, { o: 0.8 }], ["fill", 100, 28, 18, 22, 3, { color: "orange", mv: { y: -4 } }]],
  // Two LED bars, green to red; a peak light high on the left one.
  "level-meter": [["fill", 52, 50, 16, 16, 2, { o: 0.9 }], ["fill", 52, 32, 16, 16, 2, { o: 0.6 }], ["fill", 52, 14, 16, 16, 2, { color: "orange", mv: { opacity: 0.2 } }], ["fill", 82, 50, 16, 16, 2, { o: 0.9 }], ["fill", 82, 32, 16, 16, 2, { o: 0.25 }], ["fill", 82, 14, 16, 16, 2, { o: 0.15 }]],
  // A graticule and a glowing wave.
  oscilloscope: [["box", 14, 10, 122, 60, 6], ["path", "M14 40h122M75 10v60", { o: 0.25 }], ["path", "M18 40c10-24 18-24 28 0s18 24 28 0 18-24 28 0 18 24 30 0", { w: 2.5, mv: { x: 4 } }]],
  // Spectrum bars, tall in the bass, with falling caps.
  spectrum: [["path", "M12 68h126", { o: 0.35 }], ["fill", 18, 30, 10, 38, 2], ["fill", 32, 20, 10, 48, 2, { mv: { scale: 0.8 } }], ["fill", 46, 36, 10, 32, 2], ["fill", 60, 44, 10, 24, 2], ["fill", 74, 38, 10, 30, 2, { color: "orange" }], ["fill", 88, 50, 10, 18, 2], ["fill", 102, 54, 10, 14, 2], ["fill", 116, 58, 10, 10, 2], ["fill", 32, 14, 10, 3, 1, { o: 0.6 }]],
  // Mirrored bars of a voice message; the played part in the accent, the playhead moving on.
  waveform: [["shape", "M14 34h4v12h-4zM22 28h4v24h-4zM30 22h4v36h-4zM38 30h4v20h-4zM46 24h4v32h-4zM54 32h4v16h-4z"], ["shape", "M62 26h4v28h-4zM70 20h4v40h-4zM78 30h4v20h-4zM86 34h4v12h-4zM94 26h4v28h-4zM102 32h4v16h-4zM110 28h4v24h-4zM118 34h4v12h-4zM126 36h4v8h-4z", { o: 0.3 }], ["path", "M60 14v52", { w: 2, color: "orange", mv: { x: 10 } }]],
  // An avatar whose ring breathes with the voice.
  "audio-reactive": [["ring", 75, 40, 28, { w: 4, mv: { scale: 1.12, opacity: 0.5 } }], ["dot", 75, 40, 20, { o: 0.5 }], ["ln", 108, 32, 26], ["ln", 108, 46, 18]],
};
