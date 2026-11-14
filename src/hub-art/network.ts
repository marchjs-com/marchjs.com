import type { ArtSet } from "./types.ts";

/** Drawings for the Network section (topics.ts › "/network"). */
export const art: ArtSet = {
  // Request rows (status, method, name, time); the middle one shows its middleware steps.
  "monitor": [["dot", 16, 14, 3.500, { color: "green" }], ["fill", 26, 10, 18, 8, 4, { o: 0.3 }], ["ln", 50, 11.500, 40], ["fill", 104, 11, 30, 6, 3, { o: 0.5 }], ["dot", 16, 34, 3.500, { color: "orange" }], ["fill", 26, 30, 18, 8, 4, { o: 0.3 }], ["ln", 50, 31.500, 30, { o: 0.7 }], ["fill", 50, 44, 14, 5, 2.500, { mv: { x: 4 } }], ["fill", 67, 44, 24, 5, 2.500, { o: 0.6, mv: { x: 4 } }], ["fill", 94, 44, 12, 5, 2.500, { o: 0.3, mv: { x: 4 } }], ["dot", 16, 64, 3.500, { color: "green" }], ["fill", 26, 60, 18, 8, 4, { o: 0.3 }], ["ln", 50, 61.500, 46], ["fill", 104, 61, 18, 6, 3, { o: 0.5 }]],
  // Three callers share one request and one answer.
  "dedupe": [["path", "M22 18c24 0 24 22 48 22", { o: 0.6 }], ["path", "M22 40h48", { o: 0.6 }], ["path", "M22 62c24 0 24-22 48-22", { o: 0.6 }], ["path", "M70 40h38", { w: 2.4 }], ["dot", 16, 18, 5], ["dot", 16, 40, 5], ["dot", 16, 62, 5], ["box", 110, 26, 28, 28, 7], ["dot", 124, 40, 4, { o: 0.5 }], ["dot", 84, 40, 4, { color: "orange", mv: { x: 16 } }]],
  // Two older requests are cancelled; only the last one arrives.
  "latest": [["path", "M14 18h58", { o: 0.3 }], ["path", "m78 14 8 8m0-8-8 8", { color: "orange" }], ["path", "M14 38h58", { o: 0.3 }], ["path", "m78 34 8 8m0-8-8 8", { color: "orange" }], ["path", "M14 58h100m-7-7 7 7-7 7", { mv: { x: 6 } }], ["dot", 131, 58, 6]],
  // A switch between a mock provider (dashed, braces) and the real server.
  "mock": [["box", 10, 20, 40, 40, 8, { dash: true }], ["path", "M26 30c-4 0-4 4-4 6s0 4-3 4c3 0 3 2 3 4s0 6 4 6"], ["path", "M34 30c4 0 4 4 4 6s0 4 3 4c-3 0-3 2-3 4s0 6-4 6"], ["box", 58, 30, 34, 20, 10], ["dot", 68, 40, 6, { mv: { x: 14 } }], ["box", 100, 20, 40, 40, 8], ["ln", 108, 29, 24, { o: 0.6 }], ["ln", 108, 39, 24], ["dot", 111, 52, 2.500]],
  // Two ends and a two-way stream of messages.
  "websocket": [["box", 10, 26, 28, 28, 7], ["dot", 24, 40, 4], ["box", 112, 26, 28, 28, 7], ["ln", 118, 37.500, 16], ["path", "M44 34h62m-6-5 6 5-6 5"], ["path", "M106 46H44m6-5-6 5 6 5", { o: 0.5 }], ["dot", 66, 34, 3.500, { color: "orange", mv: { x: 18 } }], ["dot", 88, 46, 3, { o: 0.5 }]],
  // Errors from several sources flow into one collector with a repeat badge.
  "errors": [["path", "M24 10l10 18H14z"], ["path", "M24 17v5"], ["path", "M24 46l10 18H14z", { color: "orange" }], ["path", "M24 53v5", { color: "orange" }], ["path", "M38 22c20 0 20 18 40 18", { o: 0.5 }], ["path", "M38 58c20 0 20-18 40-18", { o: 0.5 }], ["box", 82, 22, 52, 36, 8], ["ln", 90, 31, 36, { o: 0.6 }], ["ln", 90, 42, 26], ["dot", 132, 24, 6, { color: "orange", mv: { scale: 1.2 } }]],
};
