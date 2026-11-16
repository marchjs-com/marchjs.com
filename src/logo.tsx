// The MarchJS mark: an M drawn as 15 dots. Each leg runs from a large dot at the top to a large dot at the foot,
// smallest in the middle, its colour blending from the top corner to the foot; the dots between the peaks hang on a
// curve to the red one at the centre. Each pair of dots is spaced in proportion to their sizes. The same drawing is
// public/favicon.svg.

/** [cx, cy, r, fill] in a 120 × 104 box: the left leg top to foot, the right leg, then the curve between the peaks. */
export const MARK_DOTS: [number, number, number, string][] = [
  [28, 17.7, 9, "#F2801F"],
  [24.7, 36.4, 7.2, "#E39000"],
  [21.1, 53.2, 5.4, "#CAA000"],
  [16.8, 69.7, 7.2, "#A7B100"],
  [10, 87.7, 7.65, "#78BE3A"],
  [92, 17.7, 9, "#1D9AD6"],
  [95.3, 36.4, 7.2, "#6896E1"],
  [98.9, 53.2, 5.4, "#9292DF"],
  [103.2, 69.7, 7.2, "#B291D4"],
  [110, 87.7, 7.65, "#C994C4"],
  [39.8, 36.4, 6.75, "#EA6B2C"],
  [49.5, 52, 4.95, "#DF5739"],
  [60, 65.7, 4.32, "#D24444"],
  [70.5, 52, 4.95, "#BC57A9"],
  [80.2, 36.4, 6.75, "#8379DE"],
]

/** `<MarchLogo />` — the mark alone; `<MarchLogo wordmark />` with "MarchJS" under it. */
export function MarchLogo(props: { wordmark?: boolean; class?: string }) {
  return <span class={`sc-logo ${props.class ?? ""}`}>
    <svg class="sc-logo-mark" viewBox="0 0 120 104" role="img" aria-label="MarchJS">
      {MARK_DOTS.map(([cx, cy, r, fill]) => <circle cx={cx} cy={cy} r={r} fill={fill} />)}
    </svg>
    {props.wordmark ? <span class="sc-logo-word">MarchJS</span> : null}
  </span>
}
