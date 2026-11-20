import type { ArtSet } from "./types.ts";

/** Drawings for the Text section (topics.ts › "/text"). */
export const art: ArtSet = {
  tooltip: [
    ["fill", 38, 10, 74, 22, 7, { mv: { y: -4 } }], ["shape", "M68 31h14l-7 8Z", { mv: { y: -4 } }],
    ["box", 48, 46, 54, 24, 8], ["ln", 61, 55.5, 28, { o: 0.6 }],
  ],
  // A small badge: a mark and two words.
  "made-with-march": [
    ["box", 22, 25, 106, 30, 15], ["fill", 32, 32, 16, 16, 5, { mv: { rotate: 15 } }], ["ln", 56, 37.5, 26], ["ln", 88, 37.5, 30, { o: 0.8 }],
  ],
  // Two key caps joined by a plus; the second one is pressed.
  kbd: [
    ["box", 18, 22, 42, 37, 8], ["box", 18, 22, 42, 31, 8], ["ln", 28, 35, 22, { o: 0.7 }], ["path", "M75 34v12M69 40h12", { o: 0.6 }],
    ["box", 94, 22, 38, 37, 8], ["box", 94, 22, 38, 31, 8, { mv: { y: 4 } }], ["ln", 106, 35, 14, { o: 0.7, mv: { y: 4 } }],
  ],
  "section-label": [
    ["ln", 14, 13, 36, { o: 0.7 }], ["fill", 56, 11, 15, 9, 4.5, { o: 0.25 }], ["path", "M131 11v9M126.5 15.5h9", { mv: { scale: 1.3 } }],
    ["box", 14, 27, 122, 19, 6], ["ln", 24, 34, 60], ["box", 14, 51, 122, 19, 6], ["ln", 24, 58, 44],
  ],
  "clamp-text": [
    ["ln", 16, 12, 118], ["ln", 16, 24, 118], ["ln", 16, 36, 84], ["ln", 16, 48, 118, { o: 0.12 }],
    ["fill", 16, 62, 36, 5, 2.5, { mv: { y: 4 } }], ["path", "m58 62.5 4 4 4-4", { mv: { y: 4 } }],
  ],
};
