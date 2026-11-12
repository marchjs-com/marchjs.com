// Page transitions demo: one tile's page. The big tile carries the same data-hm-shared name as the small one in the
// grid, so it moves from there to here. In the modal, the previous / next links swap the page inside it.
import { Link, back } from "hadi-march/router";
import { Button } from "hadi-march/ui";
import { TILES } from "./tiles.ts";

// the page module's own meta joins the route's: a slower cross-fade so the tile's move is easy to follow
export const meta = { transition: { type: "fade", duration: 360 } }

export default function TilePage(props: { params: { id: string }; close?: () => void }) {
  const i = TILES.findIndex((x) => x.id === props.params.id)
  const t = TILES[i]
  if (!t) return <p class="hm-muted">Kare yok.</p>
  const prev = TILES[(i + TILES.length - 1) % TILES.length]!, next = TILES[(i + 1) % TILES.length]!
  const modal = !!props.close
  return <div class={modal ? "sc-tr-page sc-tr-in-modal" : "sc-tr-page"}>
    <div class={`sc-tr-big sc-tr-c${t.tone}`} data-hm-shared={`tile-${t.id}`}>{t.name}</div>
    <p>{modal ? "Önceki ve sonraki kare pencerenin içini geçişle değiştirir." : "Kare ızgaradaki yerinden buraya taşındı. Geri dönünce yerine geri gider."}</p>
    <div class="sc-row">
      <Link href={`/transitions/tile/${prev.id}`} modal={modal} replace={modal} class="hm-btn hm-btn-secondary hm-btn-sm">{`← ${prev.name}`}</Link>
      <Link href={`/transitions/tile/${next.id}`} modal={modal} replace={modal} class="hm-btn hm-btn-secondary hm-btn-sm">{`${next.name} →`}</Link>
      {modal ? <Button size="sm" variant="ghost" on:click={props.close}>Kapat</Button> : <Button size="sm" variant="ghost" on:click={() => back()}>Geri</Button>}
    </div>
  </div>
}
