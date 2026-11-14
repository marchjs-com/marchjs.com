import type { ArtSet } from "./types.ts";

/** Drawings for the SEO section (topics.ts › "/seo"). */
export const art: ArtSet = {
  // A browser tab whose title changes, over the head tags.
  "live-head": [["box", 10, 28, 130, 44, 8], ["box", 18, 8, 62, 24, 7], ["dot", 29, 19, 3.500], ["ln", 38, 16.500, 32, { o: 0.7, mv: { x: 5 } }], ["path", "M25 40l-5 5 5 5"], ["ln", 31, 42.500, 50], ["path", "M87 40l5 5-5 5"], ["path", "M25 55l-5 5 5 5"], ["ln", 31, 57.500, 70], ["path", "M107 55l5 5-5 5"]],
  // An address bar with path segments, resolved to one absolute link.
  "history-site": [["box", 10, 10, 130, 24, 12], ["ring", 24, 22, 4.500], ["ln", 36, 19.500, 34, { o: 0.7 }], ["path", "M76 28l6-12"], ["ln", 88, 19.500, 20], ["path", "M114 28l6-12"], ["path", "M75 38v10m-4-4 4 4 4-4", { mv: { y: 3 } }], ["fill", 30, 54, 90, 16, 8, { o: 0.2 }], ["ln", 40, 59.500, 70, { o: 0.7 }]],
  // Braces around key and value lines.
  "json-ld": [["path", "M40 10c-8 0-8 6-8 14s0 16-8 16c8 0 8 8 8 16s0 14 8 14"], ["path", "M110 10c8 0 8 6 8 14s0 16 8 16c-8 0-8 8-8 16s0 14-8 14"], ["ln", 48, 17, 18, { o: 0.8 }], ["ln", 70, 17, 28, { o: 0.7, color: "orange" }], ["ln", 48, 30, 24, { o: 0.8 }], ["ln", 76, 30, 20, { o: 0.7, color: "orange" }], ["ln", 48, 43, 14, { o: 0.8 }], ["ln", 66, 43, 32, { o: 0.7, color: "orange" }], ["ln", 48, 56, 20, { o: 0.8 }], ["ln", 72, 56, 24, { o: 0.7, color: "orange", mv: { x: 4 } }]],
  // A page audit: passed checks and one warning.
  "seo-check": [["ring", 22, 16, 7, { color: "green" }], ["path", "m18.500 16 2.500 2.500 4.500-5", { color: "green" }], ["ln", 38, 13.500, 80], ["ring", 22, 40, 7, { color: "orange", mv: { scale: 1.2 } }], ["path", "M22 36v4.500", { color: "orange" }], ["dot", 22, 43.500, 1, { color: "orange" }], ["ln", 38, 37.500, 60, { o: 0.7 }], ["ring", 22, 64, 7, { color: "green" }], ["path", "m18.500 64 2.500 2.500 4.500-5", { color: "green" }], ["ln", 38, 61.500, 72]],
  // An HTML file written at build time becomes a live page.
  "prerender": [["path", "M20 12h26l12 12v44H20z"], ["path", "M46 12v12h12"], ["path", "M34 40l-6 6 6 6m10-12 6 6-6 6"], ["path", "M66 40h14m-5-5 5 5-5 5"], ["box", 90, 12, 44, 56, 7], ["ln", 98, 22, 28, { o: 0.6 }], ["ln", 98, 32, 20], ["fill", 98, 48, 28, 12, 6, { mv: { scale: 1.1 } }]],
};
