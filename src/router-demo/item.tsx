// Router demo: one record. The same page serves the named outlet (beside), the modal route (over the list) and a
// full page (direct visit). close() is given in an outlet or a modal.
import { Button } from "march/ui";
import { PEOPLE } from "./data.ts";

export default function RouterItem(props: { params: { id: string }; close?: () => void }) {
  const p = PEOPLE.find((x) => x.id === props.params.id)
  if (!p) return <p class="m-muted">Kayıt yok.</p>
  return <div class="m-stack">
    <h3>{p.name}</h3>
    <p>{`${p.city} · ${p.role}`}</p>
    {props.close ? <Button size="sm" variant="secondary" on:click={props.close}>Kapat</Button> : null}
  </div>
}
