import type { ArtSet } from "./types.ts";

/** Drawings for the accessibility managers section (topics.ts › "/managers-a11y"). */
export const art: ArtSet = {
  // A stack of layers; the top one lifts.
  "layer": [["shape", "M75 40l44 14-44 14-44-14z", { o: 0.2 }], ["shape", "M75 28l44 14-44 14-44-14z", { o: 0.45 }], ["shape", "M75 16l44 14-44 14-44-14z", { mv: { y: -5 } }]],
  // A focus ring that moves between buttons, and the loop that traps it.
  "focus": [["box", 58, 20, 34, 32, 11, { w: 2.4, mv: { x: 30 } }], ["box", 32, 24, 26, 24, 8], ["ln", 38, 33.500, 14], ["box", 62, 24, 26, 24, 8], ["ln", 68, 33.500, 14, { o: 0.7 }], ["box", 92, 24, 26, 24, 8], ["ln", 98, 33.500, 14], ["path", "M105 58c0 10-60 10-60 0", { o: 0.5 }], ["path", "M41 63l4-5 5 4", { o: 0.5 }]],
  // A modifier key plus a key; the key is pressed.
  "hotkey": [["box", 22, 22, 44, 36, 8], ["ln", 32, 37.500, 24, { o: 0.6 }], ["path", "M77 35v10m-5-5h10"], ["box", 92, 22, 36, 36, 8, { mv: { y: 3 } }], ["dot", 110, 40, 4, { mv: { y: 3 } }]],
  // A speaker, sound waves and the announced message.
  "announcer": [["shape", "M24 34h10l14-10v32L34 46H24z"], ["path", "M56 32a12 12 0 0 1 0 16", { mv: { x: 3 } }], ["path", "M64 26a20 20 0 0 1 0 28", { o: 0.5, mv: { x: 3 } }], ["box", 86, 26, 46, 28, 8], ["ln", 94, 33, 30, { o: 0.6 }], ["ln", 94, 43, 20]],
  // The accessibility figure and three preference switches.
  "accessibility": [["ring", 40, 40, 24], ["dot", 40, 27, 3.500], ["path", "M28 35h24M40 35v11l-7 12m7-12 7 12"], ["ln", 76, 20, 30, { o: 0.6 }], ["box", 116, 16, 22, 13, 6.500], ["dot", 131, 22.500, 3.500], ["ln", 76, 37.500, 36, { o: 0.6 }], ["box", 116, 33.500, 22, 13, 6.500], ["dot", 123, 40, 3.500, { o: 0.5, mv: { x: 8 } }], ["ln", 76, 55, 24, { o: 0.6 }], ["box", 116, 51, 22, 13, 6.500], ["dot", 131, 57.500, 3.500]],
  // Buttons with a key badge on each corner.
  "shortcut-hints": [["box", 14, 28, 34, 30, 8], ["dot", 31, 43, 5, { o: 0.35 }], ["box", 58, 28, 34, 30, 8], ["dot", 75, 43, 5, { o: 0.35 }], ["box", 102, 28, 34, 30, 8], ["dot", 119, 43, 5, { o: 0.35 }], ["fill", 38, 19, 16, 14, 4, { mv: { scale: 1.15 } }], ["fill", 82, 19, 16, 14, 4, { mv: { scale: 1.15 } }], ["fill", 126, 19, 16, 14, 4, { mv: { scale: 1.15 } }]],
};
