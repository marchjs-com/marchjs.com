// Small drawings for the category cards: one per topic page, a schematic of what the component looks like.
// A drawing is data (a list of shapes on a 150 × 80 canvas), not markup: the renderer (hub-art.tsx) builds the SVG
// from it, in the theme's colours. One part of a drawing can move while its card is hovered.

/** A brand colour for a shape that must stand apart from the accent (a second series, a status). */
export type ArtColor = "orange" | "blue" | "green" | "purple" | "pink" | "gold";

/** How a shape moves while its card is hovered (px on the 150 × 80 canvas; all optional). */
export interface ArtMove { x?: number; y?: number; scale?: number; rotate?: number; opacity?: number }

export interface ArtOpts {
  /** Opacity (0–1). */
  o?: number;
  /** A brand colour instead of the accent. */
  color?: ArtColor;
  /** Dashed outline. */
  dash?: boolean;
  /** Stroke width (default 1.6). */
  w?: number;
  /** The shape moves like this while the card is hovered. */
  mv?: ArtMove;
}

/**
 * One shape:
 * - `["box", x, y, w, h, r?, opts?]`     an outlined rounded box with the surface colour inside (a field, a card)
 * - `["fill", x, y, w, h, r?, opts?]`    a filled rounded box in the accent (a button, a selected part); `o` fades it
 * - `["ln", x, y, w, opts?]`             a line of text: a 5px rounded bar (`o` 0.35 by default)
 * - `["dot", cx, cy, r?, opts?]`         a filled circle (r 5 by default)
 * - `["ring", cx, cy, r, opts?]`         an outlined circle
 * - `["path", d, opts?]`                 an outlined path (no fill, round caps and joins)
 * - `["shape", d, opts?]`                a filled path
 */
export type Shape =
  | ["box", number, number, number, number, number?, ArtOpts?]
  | ["fill", number, number, number, number, number?, ArtOpts?]
  | ["ln", number, number, number, ArtOpts?]
  | ["dot", number, number, number?, ArtOpts?]
  | ["ring", number, number, number, ArtOpts?]
  | ["path", string, ArtOpts?]
  | ["shape", string, ArtOpts?];

/** The drawings of one section: topic slug (topics.ts) → shapes. */
export type ArtSet = Record<string, readonly Shape[]>;
