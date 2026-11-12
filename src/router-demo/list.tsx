// Router demo: the list page (its own toolbar buttons through <Portal to="toolbar">).
import { Link } from "hadi-march/router";
import { Portal } from "hadi-march";
import { Button, toast } from "hadi-march/ui";
import { PEOPLE } from "./data.ts";

export default function RouterList() {
  return <>
    <Portal to="toolbar" order={0}><Button size="sm" variant="secondary" on:click={() => toast("Listedeki 'Yeni kayıt' düğmesi", { kind: "info" })}>Yeni kayıt</Button></Portal>
    <h3>Liste</h3>
    <ul class="sc-router-list">
      {PEOPLE.map((p) => <li>
        <strong>{p.name}</strong>
        <Link href={`/item/${p.id}`} outlet="aside" class="hm-btn hm-btn-ghost hm-btn-sm">Yanda aç</Link>
        <Link href={`/navigation/router/item/${p.id}`} modal class="hm-btn hm-btn-ghost hm-btn-sm">Pencerede aç</Link>
      </li>)}
    </ul>
  </>
}
