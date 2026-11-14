import type { ArtSet } from "./types.ts";

/** Drawings for the environment managers section (topics.ts › "/managers-env"). */
export const art: ArtSet = {
  // A moon and a few stars: nobody is at the keyboard.
  "idle": [["shape", "M60 16a24 24 0 1 0 26 34a26 26 0 0 1-26-34z"], ["dot", 100, 24, 2.500, { mv: { y: -3 } }], ["dot", 112, 42, 2, { o: 0.5, mv: { y: -3 } }], ["dot", 98, 56, 1.500, { o: 0.5, mv: { y: -3 } }]],
  // Overlapping avatars with online dots, and a typing bubble.
  "presence": [["box", 22, 16, 28, 28, 14], ["box", 42, 16, 28, 28, 14], ["box", 62, 16, 28, 28, 14], ["dot", 46, 40, 4, { color: "green" }], ["dot", 86, 40, 4, { color: "green" }], ["box", 98, 20, 34, 20, 10], ["dot", 107, 30, 2.500], ["dot", 115, 30, 2.500, { mv: { y: -3 } }], ["dot", 123, 30, 2.500], ["ln", 22, 56, 68], ["ln", 22, 65, 40, { o: 0.2 }]],
  // Two tabs holding the same state, with arrows both ways.
  "sync": [["box", 10, 18, 50, 44, 7], ["ln", 16, 24, 20, { o: 0.6 }], ["dot", 35, 45, 6], ["box", 90, 18, 50, 44, 7], ["ln", 96, 24, 20, { o: 0.6 }], ["dot", 115, 45, 6, { mv: { scale: 1.2 } }], ["path", "M66 34h18m-5-4 5 4-5 4"], ["path", "M84 46H66m5-4-5 4 5 4", { o: 0.5 }]],
  // A session clock running down, and the way out.
  "session": [["ring", 46, 40, 22, { o: 0.3 }], ["path", "M46 18a22 22 0 1 1-19 33", { w: 3 }], ["path", "M46 28v12l7 5"], ["path", "M110 22H94v36h16"], ["path", "M104 40h24m-6-6 6 6-6 6", { mv: { x: 4 } }]],
  // A permission prompt: lock, question, deny and allow.
  "permission": [["box", 22, 8, 106, 64, 9], ["box", 34, 25, 18, 14, 3], ["path", "M38 25v-4a5 5 0 0 1 10 0v4"], ["ln", 60, 21, 50, { o: 0.7 }], ["ln", 60, 31, 36], ["box", 58, 50, 30, 13, 6.500], ["fill", 92, 50, 30, 13, 6.500, { mv: { scale: 1.1 } }]],
  // A map pin above its ripples.
  "location": [["path", "M41 62c0-6 15-9 34-9s34 3 34 9-15 9-34 9-34-3-34-9z", { o: 0.2 }], ["path", "M57 62c0-3 8-5 18-5s18 2 18 5-8 5-18 5-18-2-18-5z", { o: 0.45 }], ["path", "M75 62C63 46 59 40 59 30a16 16 0 0 1 32 0c0 10-4 16-16 32z", { w: 2.4, mv: { y: -4 } }], ["dot", 75, 30, 5, { mv: { y: -4 } }]],
  // A bell with a badge and the notification it shows.
  "notification": [["path", "M28 52h32c-4-4-5-8-5-16a11 11 0 0 0-22 0c0 8-1 12-5 16z"], ["path", "M40 58a4 4 0 0 0 8 0"], ["dot", 56, 26, 5, { color: "orange" }], ["box", 74, 24, 58, 30, 7, { mv: { x: -4 } }], ["dot", 84, 34, 3, { mv: { x: -4 } }], ["ln", 92, 31.500, 30, { o: 0.7, mv: { x: -4 } }], ["ln", 82, 43, 40, { mv: { x: -4 } }]],
  // A window with a title bar and full-screen arrows.
  "window": [["box", 22, 10, 106, 60, 8], ["dot", 32, 19, 2.500], ["dot", 40, 19, 2.500, { o: 0.5 }], ["dot", 48, 19, 2.500, { o: 0.3 }], ["path", "M22 28h106", { o: 0.4 }], ["path", "M80 45l12-8m-7-1h7v7", { mv: { x: 3, y: -3 } }], ["path", "M70 53l-12 8m0-7v7h7", { o: 0.6 }]],
  // A section list with the active mark, next to the sections themselves.
  "scroll": [["path", "M20 14v52", { o: 0.3 }], ["dot", 20, 18, 3, { o: 0.4 }], ["dot", 20, 40, 4.500, { mv: { scale: 1.2 } }], ["dot", 20, 62, 3, { o: 0.4 }], ["ln", 30, 15.500, 22], ["ln", 30, 37.500, 26, { o: 0.8 }], ["ln", 30, 59.500, 20], ["box", 70, 8, 66, 64, 8], ["fill", 78, 15, 50, 14, 4, { o: 0.2 }], ["fill", 78, 33, 50, 14, 4, { o: 0.6 }], ["fill", 78, 51, 50, 14, 4, { o: 0.2 }]],
  // A phone, its battery and its signal.
  "device": [["box", 25, 8, 36, 64, 8], ["ln", 36, 14, 14], ["dot", 43, 64, 2], ["box", 77, 16, 44, 20, 5], ["fill", 121, 22, 4, 8, 2], ["fill", 81, 20, 24, 12, 3, { color: "green" }], ["path", "M83 54a22 22 0 0 1 32 0", { o: 0.6, mv: { opacity: 0.15 } }], ["path", "M89 60a13 13 0 0 1 20 0"], ["dot", 99, 66, 2.500]],
};
