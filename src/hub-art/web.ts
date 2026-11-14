import type { ArtSet } from "./types.ts";

/** Drawings for the Web blocks section (topics.ts › "/web"). */
export const art: ArtSet = {
  // Centred eyebrow, headline, description and two actions.
  "hero": [["fill", 58, 8, 34, 8, 4, { o: 0.25 }], ["fill", 30, 22, 90, 8, 4, { o: 0.9 }], ["fill", 45, 34, 60, 8, 4, { o: 0.5 }], ["ln", 40, 48, 70], ["fill", 40, 60, 32, 13, 6.5, { mv: { scale: 1.1 } }], ["box", 78, 60, 32, 13, 6.5]],
  // A floating pill bar; the page scrolls under it.
  "site-nav": [["ln", 30, 46, 90, { o: 0.2, mv: { y: -8 } }], ["ln", 45, 58, 60, { o: 0.2, mv: { y: -8 } }], ["box", 8, 10, 134, 22, 11], ["dot", 22, 21, 5], ["ln", 40, 18.5, 18], ["ln", 64, 18.5, 18], ["ln", 88, 18.5, 18], ["fill", 114, 15, 22, 12, 6]],
  // Bento: one large card and three small ones.
  "feature-grid": [["box", 10, 8, 62, 64, 8, { mv: { y: -2 } }], ["dot", 26, 26, 6, { mv: { y: -2 } }], ["ln", 18, 42, 40, { o: 0.6, mv: { y: -2 } }], ["ln", 18, 52, 28, { mv: { y: -2 } }], ["box", 78, 8, 62, 29, 8], ["dot", 90, 22.500, 4, { o: 0.5 }], ["ln", 100, 20, 30], ["box", 78, 43, 28, 29, 8], ["dot", 92, 57.500, 4, { o: 0.5 }], ["box", 112, 43, 28, 29, 8], ["dot", 126, 57.500, 4, { o: 0.5 }]],
  // Two rows of logo marks; the first row drifts.
  "logo-cloud": [["ring", 22, 27, 8, { mv: { x: -8 } }], ["fill", 40, 20, 24, 14, 7, { o: 0.4, mv: { x: -8 } }], ["box", 74, 20, 14, 14, 3, { mv: { x: -8 } }], ["dot", 106, 27, 7, { o: 0.5, mv: { x: -8 } }], ["fill", 122, 21, 20, 12, 3, { o: 0.3, mv: { x: -8 } }], ["fill", 12, 48, 20, 12, 3, { o: 0.3 }], ["dot", 48, 54, 7, { o: 0.5 }], ["box", 66, 47, 24, 14, 7], ["ring", 108, 54, 8], ["fill", 124, 47, 14, 14, 3, { o: 0.4 }]],
  // Three plans; the featured one is taller and lifts.
  "pricing": [["box", 10, 18, 38, 50, 7], ["ln", 17, 26, 18], ["fill", 17, 36, 24, 7, 3, { o: 0.4 }], ["fill", 17, 54, 24, 8, 4, { o: 0.25 }], ["box", 102, 18, 38, 50, 7], ["ln", 109, 26, 18], ["fill", 109, 36, 24, 7, 3, { o: 0.4 }], ["fill", 109, 54, 24, 8, 4, { o: 0.25 }], ["box", 54, 10, 42, 62, 8, { w: 2.4, mv: { y: -4 } }], ["ln", 62, 19, 20, { o: 0.6, mv: { y: -4 } }], ["fill", 62, 30, 26, 9, 4, { mv: { y: -4 } }], ["fill", 62, 56, 26, 9, 4.500, { mv: { y: -4 } }]],
  // Two quote cards: text, then avatar and name.
  "testimonials": [["box", 10, 12, 62, 56, 8], ["ln", 18, 22, 46, { o: 0.6 }], ["ln", 18, 32, 38], ["dot", 24, 54, 6], ["ln", 34, 51.500, 26, { o: 0.6 }], ["box", 78, 12, 62, 56, 8, { mv: { y: -4 } }], ["ln", 86, 22, 46, { o: 0.6, mv: { y: -4 } }], ["ln", 86, 32, 30, { mv: { y: -4 } }], ["dot", 92, 54, 6, { color: "orange", mv: { y: -4 } }], ["ln", 102, 51.500, 26, { o: 0.6, mv: { y: -4 } }]],
  // Accordion: the middle question is open.
  "faq": [["box", 14, 6, 122, 16, 6], ["ln", 22, 11.500, 50, { o: 0.6 }], ["path", "M122 12l4 4 4-4"], ["box", 14, 26, 122, 30, 6], ["ln", 22, 31.500, 60, { o: 0.7 }], ["path", "M122 36l4-4 4 4"], ["ln", 22, 43, 90, { mv: { y: 3 } }], ["box", 14, 60, 122, 14, 6], ["ln", 22, 64.500, 44, { o: 0.6 }], ["path", "M122 65l4 4 4-4"]],
  // Three big numbers with labels, divided by rules.
  "stats-band": [["fill", 16, 26, 28, 12, 4, { mv: { y: -4 } }], ["ln", 16, 46, 22], ["path", "M52 22v34", { o: 0.3 }], ["fill", 61, 26, 28, 12, 4, { mv: { y: -4 } }], ["ln", 61, 46, 22], ["path", "M97 22v34", { o: 0.3 }], ["fill", 106, 26, 28, 12, 4, { mv: { y: -4 } }], ["ln", 106, 46, 22]],
  // Odometer cells; the last digit rolls.
  "counter": [["box", 21, 20, 24, 40, 6], ["fill", 28, 35, 10, 10, 3], ["box", 49, 20, 24, 40, 6], ["fill", 56, 35, 10, 10, 3], ["box", 77, 20, 24, 40, 6], ["fill", 84, 35, 10, 10, 3], ["box", 105, 20, 24, 40, 6], ["fill", 112, 35, 10, 10, 3, { mv: { y: -9 } }]],
  // Vertical timeline: the line fills, the current step glows.
  "roadmap": [["path", "M30 10v60", { o: 0.25 }], ["fill", 28.500, 10, 3, 32, 1.500], ["dot", 30, 14, 5], ["ring", 30, 40, 9, { o: 0.4, mv: { scale: 1.2 } }], ["dot", 30, 40, 5], ["ring", 30, 66, 5, { o: 0.5 }], ["ln", 46, 11.500, 60, { o: 0.7 }], ["ln", 46, 37.500, 76, { o: 0.7 }], ["ln", 46, 63.500, 48]],
  // A pinned visual on the left, steps flowing on the right.
  "scroll-story": [["box", 10, 12, 58, 56, 8], ["fill", 22, 24, 34, 32, 6, { o: 0.3 }], ["ln", 80, 14, 50, { o: 0.25, mv: { y: -6 } }], ["ln", 80, 22, 36, { o: 0.2, mv: { y: -6 } }], ["fill", 76, 33, 3, 18, 1.500, { mv: { y: -6 } }], ["ln", 84, 34, 50, { o: 0.8, mv: { y: -6 } }], ["ln", 84, 44, 36, { o: 0.5, mv: { y: -6 } }], ["ln", 80, 60, 50, { o: 0.25, mv: { y: -6 } }], ["ln", 80, 68, 30, { o: 0.2, mv: { y: -6 } }]],
  // Panels in a row that slide sideways, with a track below.
  "horizontal-scroll": [["box", 20, 14, 46, 42, 8, { mv: { x: -12 } }], ["ln", 28, 24, 24, { mv: { x: -12 } }], ["box", 72, 14, 46, 42, 8, { mv: { x: -12 } }], ["ln", 80, 24, 24, { mv: { x: -12 } }], ["fill", 124, 14, 20, 42, 8, { o: 0.2, mv: { x: -12 } }], ["fill", 40, 66, 70, 3, 1.500, { o: 0.2 }], ["fill", 40, 66, 26, 3, 1.500]],
  // A thin progress bar above an article that scrolls.
  "scroll-progress": [["fill", 10, 8, 130, 4, 2, { o: 0.2 }], ["fill", 10, 8, 60, 4, 2], ["ln", 24, 24, 70, { o: 0.7, mv: { y: -6 } }], ["ln", 24, 36, 102, { mv: { y: -6 } }], ["ln", 24, 46, 96, { mv: { y: -6 } }], ["ln", 24, 56, 102, { mv: { y: -6 } }], ["ln", 24, 66, 60, { mv: { y: -6 } }]],
  // Three cards: shown, fading in, and still rising.
  "reveal": [["box", 14, 22, 36, 36, 7], ["ln", 21, 32, 22, { o: 0.6 }], ["box", 57, 22, 36, 36, 7, { o: 0.6 }], ["ln", 64, 32, 22, { o: 0.3 }], ["box", 100, 30, 36, 36, 7, { o: 0.4, dash: true, mv: { y: -8 } }], ["ln", 107, 40, 22, { o: 0.2, mv: { y: -8 } }]],
  // Sun and two mountain layers; the front one shifts.
  "parallax": [["ring", 112, 20, 8], ["shape", "M12 62L44 28l22 20 24-24 48 38z", { o: 0.2 }], ["shape", "M14 72l34-28 28 20 24-16 38 24z", { o: 0.5, mv: { x: 6 } }]],
  // Filter chips; a tile is filtered out and the rest slide over.
  "project-grid": [["fill", 19, 8, 26, 10, 5], ["box", 49, 8, 26, 10, 5], ["box", 79, 8, 26, 10, 5], ["fill", 19, 26, 24, 46, 6, { o: 0.4 }], ["box", 48, 26, 24, 46, 6, { dash: true, o: 0.4 }], ["fill", 77, 26, 24, 46, 6, { o: 0.4, mv: { x: -29 } }], ["fill", 106, 26, 24, 46, 6, { o: 0.4, mv: { x: -29 } }]],
  // A thumbnail that grows into the cover of a detail page.
  "project-detail": [["box", 44, 6, 96, 68, 8], ["fill", 52, 14, 80, 30, 5, { o: 0.35 }], ["ln", 52, 52, 50, { o: 0.7 }], ["ln", 52, 62, 70], ["fill", 10, 30, 22, 20, 5, { mv: { x: 8, scale: 1.15 } }]],
  // A slide with a title and bullets that step in, dots below.
  "presentation": [["box", 22, 6, 106, 56, 6], ["fill", 34, 15, 46, 7, 3], ["dot", 37, 32.500, 2], ["ln", 44, 30, 50], ["dot", 37, 42.500, 2], ["ln", 44, 40, 40], ["dot", 37, 52.500, 2, { mv: { x: 6 } }], ["ln", 44, 50, 56, { mv: { x: 6 } }], ["dot", 67, 70, 2, { o: 0.3 }], ["dot", 75, 70, 2.500], ["dot", 83, 70, 2, { o: 0.3 }]],
  // A media frame with a play mark and text over it.
  "video-background": [["fill", 10, 8, 130, 64, 8, { o: 0.15 }], ["ring", 75, 32, 13], ["shape", "M71 25l11 7-11 7z", { mv: { scale: 1.15 } }], ["ln", 50, 54, 50, { o: 0.6 }], ["ln", 60, 63, 30]],
  // A tinted band with a centred call and one button.
  "cta-band": [["fill", 8, 14, 134, 52, 12, { o: 0.18 }], ["dot", 24, 26, 3, { o: 0.3 }], ["dot", 128, 54, 4, { o: 0.3 }], ["fill", 40, 23, 70, 7, 3.500, { o: 0.9 }], ["ln", 48, 35, 54], ["fill", 56, 46, 38, 13, 6.500, { mv: { scale: 1.1 } }]],
  // Heading, e-mail field with a button, and a success line.
  "newsletter": [["ln", 10, 12, 50, { o: 0.6 }], ["box", 10, 26, 92, 28, 8], ["ln", 20, 37.500, 40, { o: 0.6 }], ["fill", 106, 26, 34, 28, 8, { mv: { scale: 1.08 } }], ["ring", 16, 66, 5, { color: "green" }], ["path", "m13.500 66 2 2 3.500-4", { color: "green" }], ["ln", 26, 63.500, 44, { o: 0.5 }]],
  // Brand, link columns, legal line and a back-to-top arrow.
  "site-footer": [["path", "M10 10h130", { o: 0.3 }], ["dot", 15, 24, 5], ["ln", 10, 36, 26], ["ln", 50, 20, 20, { o: 0.7 }], ["ln", 50, 30, 16], ["ln", 82, 20, 20, { o: 0.7 }], ["ln", 82, 30, 22], ["ln", 114, 20, 20, { o: 0.7 }], ["ln", 114, 30, 18], ["path", "M10 54h130", { o: 0.2 }], ["ln", 10, 63, 50, { o: 0.2 }], ["path", "M134 70v-9m-4 4 4-4 4 4", { mv: { y: -3 } }]],
  // Two layers in one frame, split by a draggable divider.
  "before-after": [["box", 10, 10, 130, 60, 8], ["fill", 10, 10, 65, 60, 8, { o: 0.25 }], ["ln", 20, 20, 30], ["ring", 110, 32, 8, { o: 0.5 }], ["ln", 96, 52, 30], ["fill", 74, 6, 2, 68, 1, { mv: { x: 14 } }], ["dot", 75, 40, 7, { mv: { x: 14 } }]],
  // A checklist of "not for you" lines, marked with crosses.
  "not-for-you": [["box", 14, 10, 16, 16, 5], ["path", "m19 15 6 6m0-6-6 6", { color: "orange" }], ["ln", 38, 15.500, 70, { o: 0.6 }], ["box", 14, 32, 16, 16, 5], ["path", "m19 37 6 6m0-6-6 6", { color: "orange", mv: { scale: 1.2 } }], ["ln", 38, 37.500, 86, { o: 0.6 }], ["box", 14, 54, 16, 16, 5], ["ln", 38, 59.500, 60]],
  // A comparison table; the row where we fall behind is flagged.
  "honest-compare": [["ln", 12, 10, 30, { o: 0.6 }], ["fill", 66, 8, 24, 9, 4], ["ln", 104, 10, 22, { o: 0.5 }], ["ln", 12, 27.500, 36], ["dot", 78, 30, 4], ["dot", 115, 30, 4, { o: 0.4 }], ["ln", 12, 43.500, 44], ["dot", 78, 46, 4], ["ring", 115, 46, 4, { o: 0.4 }], ["fill", 8, 54, 134, 16, 5, { o: 0.15, color: "orange" }], ["ln", 12, 59.500, 36], ["ring", 78, 62, 4, { color: "orange", mv: { scale: 1.2 } }], ["dot", 115, 62, 4, { o: 0.4 }]],
  // An activity feed; the newest row slides in at the top.
  "live-feed": [["box", 14, 6, 122, 18, 6, { mv: { y: 3 } }], ["dot", 26, 15, 5, { color: "green", mv: { y: 3 } }], ["ln", 38, 12.500, 70, { o: 0.7, mv: { y: 3 } }], ["box", 14, 30, 122, 18, 6], ["dot", 26, 39, 5, { o: 0.5 }], ["ln", 38, 36.500, 54], ["box", 14, 52, 122, 18, 6, { o: 0.6 }], ["dot", 26, 61, 5, { o: 0.3 }], ["ln", 38, 58.500, 62, { o: 0.2 }]],
  // A pulsing live dot next to odometer digits.
  "live-counter": [["ring", 24, 40, 9, { color: "green", o: 0.5, mv: { scale: 1.2 } }], ["dot", 24, 40, 4, { color: "green" }], ["box", 42, 22, 22, 36, 6], ["fill", 48, 35, 10, 10, 3], ["box", 67, 22, 22, 36, 6], ["fill", 73, 35, 10, 10, 3], ["box", 92, 22, 22, 36, 6], ["fill", 98, 35, 10, 10, 3], ["box", 117, 22, 22, 36, 6], ["fill", 123, 35, 10, 10, 3]],
  // A choice tree: the taken path is solid and ends in a found ending.
  "branching-story": [["path", "M26 44c18 0 12-18 28-18"], ["path", "M26 44c18 0 12 18 28 18", { o: 0.35 }], ["path", "M66 26c16 0 14-10 28-10"], ["path", "M66 26c16 0 14 12 28 12", { o: 0.35 }], ["path", "M106 16h18"], ["dot", 20, 44, 6], ["dot", 60, 26, 6, { mv: { scale: 1.2 } }], ["ring", 60, 62, 6, { o: 0.5 }], ["dot", 100, 16, 6], ["ring", 100, 38, 6, { o: 0.5 }], ["dot", 131, 16, 6, { color: "gold" }]],
  // A dashed section frame with a heading group and a content area.
  "site-section": [["box", 10, 6, 130, 68, 8, { dash: true, o: 0.5 }], ["ln", 55, 14, 40, { o: 0.7, mv: { y: -3 } }], ["ln", 45, 24, 60, { mv: { y: -3 } }], ["fill", 26, 38, 98, 28, 6, { o: 0.2 }]],
  // Left-aligned eyebrow, title, description, actions and a note.
  "section-head": [["fill", 14, 8, 28, 8, 4, { o: 0.3 }], ["fill", 14, 22, 84, 8, 4, { o: 0.9, mv: { y: -3 } }], ["ln", 14, 38, 104], ["ln", 14, 48, 70], ["fill", 14, 61, 30, 11, 5.500], ["box", 50, 61, 30, 11, 5.500], ["ln", 88, 64, 30, { o: 0.2 }]],
};
