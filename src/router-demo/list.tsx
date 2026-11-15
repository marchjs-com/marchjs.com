// Router demo: the list page (its own toolbar buttons through <Portal to="toolbar">).

import { Portal } from "march";
import { Button, toast } from "march/ui";
import { PEOPLE } from "./data.ts";

export default function RouterList() {
  return <>
    <Portal to="toolbar" order={0}><Button size="sm" variant="secondary" on:click={() => toast("Listedeki 'Yeni kayıt' düğmesi", { kind: "info" })}>Yeni kayıt</Button></Portal>
    <h3>Liste</h3>
    <ul class="sc-router-list">
      {PEOPLE.map((p) => <li>
        <strong>{p.name}</strong>
        <Button href={`/item/${p.id}`} outlet="aside" variant="ghost" size="sm">Yanda aç</Button>
        <Button href={`/navigation/router/item/${p.id}`} modal variant="ghost" size="sm">Pencerede aç</Button>
      </li>)}
    </ul>
  </>
}
