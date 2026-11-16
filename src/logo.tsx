// The MarchJS mark: an M drawn as one thick ribbon whose colour runs cyan, blue, violet, pink, orange, gold; a thin
// highlight along its top edge and a soft shadow under it give it depth. Ids are made unique per instance (several
// marks on one page). The same drawing is public/favicon.svg.
import { uid } from "march/core/util.ts";

/** The M's centre line (viewBox 0 0 120 104): up the left leg, over the left arch, down into the valley, over the right arch, down the right leg. */
export const MARK_PATH = "M16 88C26 68 29 40 36 24C41 14 51 22 56 37L60 50L64 37C69 22 79 14 84 24C91 40 94 68 104 88"

/** `<MarchLogo />` — the mark alone; `<MarchLogo wordmark />` with "MarchJS" under it. */
export function MarchLogo(props: { wordmark?: boolean; class?: string }) {
  const id = uid("mlogo")
  return <span class={`sc-logo ${props.class ?? ""}`}>
    <svg class="sc-logo-mark" viewBox="0 0 120 104" role="img" aria-label="MarchJS">
      <defs>
        <linearGradient id={`${id}-c`} x1="14" y1="0" x2="106" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#1FC8F4" />
          <stop offset=".2" stop-color="#3A6EF7" />
          <stop offset=".4" stop-color="#9B44E6" />
          <stop offset=".55" stop-color="#EE4AA0" />
          <stop offset=".75" stop-color="#FF7A2E" />
          <stop offset=".9" stop-color="#FFC23B" />
          <stop offset="1" stop-color="#A6DE5A" />
        </linearGradient>
        <linearGradient id={`${id}-h`} x1="0" y1="10" x2="0" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#fff" stop-opacity=".75" />
          <stop offset=".55" stop-color="#fff" stop-opacity=".12" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <filter id={`${id}-s`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#7A3FD0" flood-opacity=".28" />
        </filter>
      </defs>
      <path d={MARK_PATH} fill="none" stroke={`url(#${id}-c)`} stroke-width="19" stroke-linecap="round" stroke-linejoin="round" filter={`url(#${id}-s)`} />
      <path d={MARK_PATH} fill="none" stroke={`url(#${id}-h)`} stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(-2.5 -4.5)" />
    </svg>
    {props.wordmark ? <span class="sc-logo-word">MarchJS</span> : null}
  </span>
}
