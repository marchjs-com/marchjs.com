// Page transitions demo: one tile's page. The big tile carries the same data-m-shared name as the small one in the
// grid, so it moves from there to here. In the modal, the previous / next links swap the page inside it.
import { back } from "march/router";
import { Button } from "march/ui";
import { TILES } from "./tiles.ts";

export default function TilePage(props: { id: string; close?: () => void }) {
  const i = TILES.findIndex((x) => x.id === props.id)
  const t = TILES[i]
  if (!t) return <p class="m-muted">Kare yok.</p>
  const prev = TILES[(i + TILES.length - 1) % TILES.length]!, next = TILES[(i + 1) % TILES.length]!
  const modal = !!props.close
  return <div class={modal ? "sc-tr-page sc-tr-in-modal" : "sc-tr-page"}>
    <div class={`sc-tr-big sc-tr-c${t.tone}`} data-m-shared={`tile-${t.id}`}>{t.name}</div>
    <p>{modal ? "Önceki ve sonraki kare pencerenin içini geçişle değiştirir." : "Kare ızgaradaki yerinden buraya taşındı. Geri dönünce yerine geri gider."}</p>
    <div class="sc-row">
      <Button href={`/transitions/tile/${prev.id}`} modal={modal} replace={modal} size="sm">{`← ${prev.name}`}</Button>
      <Button href={`/transitions/tile/${next.id}`} modal={modal} replace={modal} size="sm">{`${next.name} →`}</Button>
      {modal ? <Button size="sm" variant="ghost" on:click={props.close}>Kapat</Button> : <Button size="sm" variant="ghost" on:click={() => back()}>Geri</Button>}
    </div>
  </div>
}
