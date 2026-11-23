// Showcase stage for ContextMenu: right-click (or Shift+F10) a card. Code is shown in the Code tab.
import { ContextMenu } from "march/components/overlays/context-menu";
import { Button } from "march/components/actions/button";
import { itemsOf, FILES } from "./playground.ts";

export const code = `<ContextMenu items={(target) => [
  { label: "Kopyala", shortcut: "mod+c", onSelect: () => copy(target) },
  "-",
  { label: "Sil", danger: true, onSelect: () => remove(target) },
]}>{cards}</ContextMenu>`

type Values = { danger: boolean; shortcuts: boolean; label: string; cardsOnly: boolean; area: string }

export default function ContextMenuDemo(props: { values: Values }) {
  let $last = "Bir karta sağ tıklayın ya da odaklayıp Shift+F10'a basın."
  let $cards = [...FILES]
  const items = (target: Element) => itemsOf({ shortcuts: props.values.shortcuts, danger: props.values.danger }, (what) => {
    $last = what
    if (what.startsWith("Silindi: ")) { const name = what.slice(9); $cards = $cards.filter((c) => c !== name) }
  })(target)
  return <div class="sc-flow-stack">
    <ContextMenu items={items} label={() => props.values.label} when={(t: Element) => !props.values.cardsOnly || !!t.closest("[data-card]")}>
      {() => (props.values.area === "text"
        ? <p tabindex="0">Bu paragrafa sağ tıklayın ya da odaklayıp Shift+F10'a basın.</p>
        : <div class="sc-row">{() => $cards.map((c, i) => <Button data-card={c} data-audit-try={i === 0 ? "contextmenu" : undefined}>{c}</Button>)}</div>)}
    </ContextMenu>
    <p class="sc-flow-muted" role="status">{() => $last}</p>
  </div>
}
