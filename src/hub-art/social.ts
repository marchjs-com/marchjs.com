import type { ArtSet } from "./types.ts";

/** Drawings for the Social section (topics.ts › "/social"). */
export const art: ArtSet = {
  // A post: author, photo with the double-tap heart, actions.
  "post-card": [["box", 30, 6, 90, 68, 9], ["dot", 41, 16, 5, { o: 0.5 }], ["ln", 50, 13.5, 30, { o: 0.6 }], ["fill", 36, 25, 78, 33, 4, { o: 0.15 }], ["shape", "M75 50c-9-6-11-10-11-13a5.5 5.5 0 0 1 11-2 5.5 5.5 0 0 1 11 2c0 3-2 7-11 13z", { color: "pink", mv: { scale: 1.2 } }], ["ln", 36, 64, 14], ["ln", 56, 64, 14]],
  // Posts stacked in a scrolling column.
  feed: [["box", 30, 10, 84, 38, 7, { mv: { y: -4 } }], ["dot", 40, 20, 4, { o: 0.5, mv: { y: -4 } }], ["ln", 48, 17.5, 30, { o: 0.6, mv: { y: -4 } }], ["fill", 36, 28, 72, 14, 3, { o: 0.15, mv: { y: -4 } }], ["box", 30, 53, 84, 21, 7, { mv: { y: -4 } }], ["dot", 40, 63, 4, { o: 0.5, mv: { y: -4 } }], ["ln", 48, 60.5, 30, { o: 0.6, mv: { y: -4 } }], ["fill", 122, 14, 3, 24, 1.5, { o: 0.3 }]],
  // Their message, my message springing up, their typing bubble.
  "chat-thread": [["box", 12, 8, 72, 18, 9], ["ln", 21, 14.5, 44], ["fill", 70, 31, 68, 18, 9, { mv: { y: -4 } }], ["box", 12, 54, 38, 18, 9], ["dot", 23, 63, 2.2, { o: 0.6 }], ["dot", 31, 63, 2.2, { o: 0.6 }], ["dot", 39, 63, 2.2, { o: 0.6 }]],
  // The writing field with an attach button and the round microphone.
  "chat-composer": [["box", 10, 24, 96, 32, 16], ["path", "M27 34v12M21 40h12", { o: 0.6 }], ["ln", 42, 37.5, 40], ["ring", 126, 40, 14, { color: "orange", w: 2, mv: { y: -3 } }], ["path", "M126 32.5v7", { color: "orange", w: 5, mv: { y: -3 } }], ["path", "M119.5 40a6.5 6.5 0 0 0 13 0M126 46.5v3", { color: "orange", mv: { y: -3 } }]],
  // Their bubble in the card colour, mine filled with a tail.
  "chat-bubble": [["box", 12, 8, 92, 30, 12], ["ln", 24, 16, 56, { o: 0.6 }], ["ln", 24, 26, 36], ["fill", 58, 44, 80, 26, 12, { color: "blue", mv: { y: -3 } }], ["shape", "M126 64c4 6 9 8 14 8-3-3-4-7-4-12z", { color: "blue", mv: { y: -3 } }]],
  // A bubble that quotes another message behind a coloured bar.
  "reply-quote": [["box", 14, 8, 122, 64, 12], ["fill", 22, 16, 106, 26, 6, { o: 0.12 }], ["fill", 22, 16, 4, 26, 2], ["ln", 33, 22, 34, { o: 0.8, mv: { x: 4 } }], ["ln", 33, 32, 60, { mv: { x: 4 } }], ["ln", 22, 50, 80, { o: 0.6 }], ["ln", 22, 60, 44, { o: 0.6 }]],
  // Three dots in a bubble; one rises.
  "typing-indicator": [["box", 40, 24, 70, 32, 16], ["dot", 59, 40, 5, { o: 0.45 }], ["dot", 75, 40, 5, { mv: { y: -6 } }], ["dot", 91, 40, 5, { o: 0.45 }]],
  // A pill of reactions; the chosen one sits in a soft circle.
  "reaction-picker": [["box", 14, 22, 122, 36, 18], ["dot", 32, 40, 7, { color: "gold" }], ["dot", 54, 40, 11.5, { o: 0.2 }], ["dot", 54, 40, 7, { color: "gold", mv: { scale: 1.2 } }], ["shape", "M76 47c-7-5-8-8-8-10a4 4 0 0 1 8-1.5 4 4 0 0 1 8 1.5c0 2-1 5-8 10z", { color: "pink" }], ["dot", 98, 40, 7, { color: "gold" }], ["path", "M120 35v10M115 40h10", { o: 0.5 }]],
  // A full-screen story with progress segments, between the previous and the next story.
  "story-viewer": [["box", 14, 16, 24, 48, 7, { o: 0.45 }], ["box", 112, 16, 24, 48, 7, { o: 0.45 }], ["box", 45, 6, 60, 68, 10], ["fill", 51, 12, 14, 3, 1.5], ["fill", 68, 12, 14, 3, 1.5], ["fill", 85, 12, 14, 3, 1.5, { o: 0.3, mv: { opacity: 1 } }], ["dot", 56, 23, 4, { o: 0.5 }], ["ln", 64, 20.5, 22, { o: 0.6 }], ["fill", 51, 32, 48, 34, 5, { o: 0.15 }]],
  // Avatars with a ring: new, seen, close friend.
  "story-ring": [["ring", 32, 36, 15, { color: "orange", w: 2.6, mv: { scale: 1.12 } }], ["dot", 32, 36, 10.5, { o: 0.35 }], ["ring", 75, 36, 15, { o: 0.3 }], ["dot", 75, 36, 10.5, { o: 0.35 }], ["ring", 118, 36, 15, { color: "green", w: 2.6 }], ["dot", 118, 36, 10.5, { o: 0.35 }], ["ln", 20, 60, 24], ["ln", 63, 60, 24], ["ln", 106, 60, 24]],
  // Segments: past ones full, the current one filling, the next empty.
  "story-progress": [["box", 10, 10, 130, 60, 10], ["fill", 18, 18, 26, 4, 2], ["fill", 47, 18, 26, 4, 2], ["fill", 76, 18, 26, 4, 2, { o: 0.25 }], ["fill", 76, 18, 13, 4, 2], ["fill", 76, 18, 13, 4, 2, { mv: { x: 9 } }], ["fill", 105, 18, 26, 4, 2, { o: 0.25 }], ["dot", 24, 34, 5, { o: 0.5 }], ["ln", 34, 31.5, 30, { o: 0.6 }], ["fill", 18, 45, 114, 17, 5, { o: 0.12 }]],
  // A heart that pops, with its ring and particles.
  "like-button": [["ring", 75, 41, 25, { o: 0.3, color: "pink" }], ["shape", "M75 56c-13-9-17-15-17-20a8.5 8.5 0 0 1 17-3 8.5 8.5 0 0 1 17 3c0 5-4 11-17 20z", { color: "pink", mv: { scale: 1.2 } }], ["dot", 50, 17, 2.2, { color: "orange" }], ["dot", 100, 17, 2.2, { color: "orange" }], ["dot", 44, 54, 2.2, { color: "orange" }], ["dot", 106, 54, 2.2, { color: "orange" }], ["dot", 75, 9, 2.2, { color: "orange" }]],
  // Follow (filled) turns into Following (outlined, with a check).
  "follow-button": [["fill", 14, 26, 50, 28, 14], ["path", "M70 40h9m-3-3 3 3-3 3", { o: 0.5 }], ["box", 86, 26, 50, 28, 14, { w: 2 }], ["path", "m96 40 4 4 7-8", { w: 2.2, mv: { scale: 1.2 } }], ["ln", 112, 37.5, 16, { o: 0.8 }]],
  // One large photo, two beside it; the last tile holds the rest (+N).
  "media-grid": [["fill", 30, 8, 44, 64, 6, { o: 0.25 }], ["fill", 78, 8, 42, 30, 6, { o: 0.25 }], ["box", 78, 42, 42, 30, 6], ["path", "M99 51v12M93 57h12", { w: 2, mv: { scale: 1.2 } }]],
  // Digit slots; only the last digit rolls up.
  "count-roll": [["box", 28, 22, 24, 36, 7], ["box", 57, 22, 24, 36, 7], ["box", 86, 22, 24, 36, 7], ["ln", 34, 37.5, 12, { o: 0.8 }], ["ln", 63, 37.5, 12, { o: 0.8 }], ["ln", 92, 31, 12, { o: 0.8, mv: { y: -5 } }], ["ln", 92, 45, 12, { o: 0.3, mv: { y: -5 } }], ["path", "M124 46V34m-5 5 5-5 5 5", { color: "green", w: 2 }]],
  // Rows of different heights: only the window is real, the rest is dashed; the scrollbar moves.
  "virtual-list": [["box", 24, 8, 90, 10, 4, { dash: true, o: 0.4 }], ["box", 16, 21, 106, 38, 7, { w: 2.2 }], ["fill", 24, 26, 90, 8, 3, { o: 0.25 }], ["fill", 24, 37, 90, 11, 3, { o: 0.25 }], ["fill", 24, 51, 90, 5, 2.5, { o: 0.25 }], ["box", 24, 62, 90, 10, 4, { dash: true, o: 0.4 }], ["fill", 130, 22, 4, 18, 2, { mv: { y: 14 } }]],
  // Cover, avatar with a story ring, name and bio, stats and a follow button.
  "profile-header": [["fill", 14, 6, 122, 30, 8, { o: 0.18 }], ["box", 24, 22, 28, 28, 14], ["dot", 38, 36, 10, { o: 0.4 }], ["ring", 38, 36, 16, { color: "orange", w: 2.2 }], ["ln", 62, 42, 36, { o: 0.75 }], ["ln", 62, 52, 56], ["fill", 108, 40, 28, 11, 5.5, { mv: { scale: 1.1 } }], ["ln", 20, 65, 24, { o: 0.6 }], ["ln", 52, 65, 24, { o: 0.6 }], ["ln", 84, 65, 24, { o: 0.6 }]],
  // A name with the check badge beside it.
  "verified-mark": [["dot", 28, 40, 14, { o: 0.3 }], ["ln", 50, 34, 44, { o: 0.75 }], ["ln", 50, 45, 30], ["box", 101, 26, 21, 21, 10.5, { color: "blue", w: 2.2, mv: { scale: 1.15 } }], ["path", "m106.5 36.5 3.5 3.5 6-7", { color: "blue", w: 2.2, mv: { scale: 1.15 } }]],
  // A photo with a status dot, initials on a colour, an icon in a rounded square.
  avatar: [["dot", 32, 40, 16, { o: 0.4 }], ["dot", 43, 52, 5, { color: "green" }], ["dot", 75, 40, 16, { o: 0.22, color: "orange", mv: { scale: 1.1 } }], ["ln", 67, 37.5, 16, { o: 0.9, color: "orange" }], ["fill", 102, 24, 32, 32, 9, { o: 0.2 }], ["path", "M118 38a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM110 50c0-5 4-8 8-8s8 3 8 8"]],
  // Overlapping avatars; the last bubble counts the rest.
  "avatar-group": [["box", 26, 24, 32, 32, 16], ["dot", 42, 40, 11, { o: 0.3 }], ["box", 48, 24, 32, 32, 16], ["dot", 64, 40, 11, { o: 0.4, color: "orange" }], ["box", 70, 24, 32, 32, 16], ["dot", 86, 40, 11, { o: 0.3 }], ["box", 92, 24, 32, 32, 16, { mv: { x: 6 } }], ["ln", 102, 37.5, 12, { o: 0.8, mv: { x: 6 } }]],
};
