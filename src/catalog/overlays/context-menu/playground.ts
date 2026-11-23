// type-only import: the spec is plain data (its page imports it without the shared component chunk)
import type { PlaygroundSpec } from "../../spec.ts";
import type { MenuItem } from "march/actions";
import { el } from "../../playground-el.ts";

interface Values { shortcuts: boolean; danger: boolean; label: string; cardsOnly: boolean; area: string }

/** The sample files under the menu. */
export const FILES = ["Rapor.pdf", "Bütçe.xlsx", "Sunum.key"];

/** The menu's items for a right-clicked target, as the shortcuts / danger switches shape them. */
export const itemsOf = (v: Pick<Values, "shortcuts" | "danger">, act: (what: string) => void = () => {}) => (target: Element): MenuItem[] => {
  const name = target.closest("[data-card]")?.getAttribute("data-card") ?? "alan";
  const sc = (k: string) => (v.shortcuts ? { shortcut: k } : {});
  return [
    { label: `Aç: ${name}`, ...sc("Enter"), onSelect: () => act(`Açıldı: ${name}`) },
    { label: "Kopyala", ...sc("mod+c"), onSelect: () => act(`Kopyalandı: ${name}`) },
    { label: "Yeniden adlandır", ...sc("F2"), onSelect: () => act(`Yeniden adlandır: ${name}`) },
    "-",
    { label: "Sil", ...(v.danger ? { danger: true } : {}), ...sc("Delete"), onSelect: () => act(`Silindi: ${name}`) },
  ];
};

/** `items` as code: the same function, written out. */
const itemsCode = (_x: unknown, v: Values): string => {
  const sc = (k: string) => (v.shortcuts ? `, shortcut: "${k}"` : "");
  return `{(target) => [
  { label: "Aç"${sc("Enter")}, onSelect: () => open(target) },
  { label: "Kopyala"${sc("mod+c")}, onSelect: () => copy(target) },
  { label: "Yeniden adlandır"${sc("F2")}, onSelect: () => rename(target) },
  "-",
  { label: "Sil"${v.danger ? ", danger: true" : ""}${sc("Delete")}, onSelect: () => remove(target) },
]}`;
};

/** A focusable card for the area (the menu reads its name from data-card). */
const card = (name: string): HTMLElement => {
  const e = el("button", "m-btn m-btn-secondary", name);
  e.setAttribute("type", "button");
  e.setAttribute("data-card", name);
  return e;
};

/** A paragraph the keyboard can reach (Shift+F10 opens the menu on the focused element). */
const para = (): HTMLElement => {
  const e = el("p", "", "Bu paragrafa sağ tıklayın ya da odaklayıp Shift+F10'a basın.");
  e.setAttribute("tabindex", "0");
  return e;
};

// every option writes a real prop of the raw component: `items` (required, a function) is built from the shortcuts /
// danger switches, `children` (the area that opens the menu) from "Alan", `when` keeps the browser menu off the cards
const spec: PlaygroundSpec<Values> = {
  options: [
    { key: "shortcuts", label: "Kısayolları göster", default: true, prop: "items", toProp: (_x, v) => itemsOf(v), toCode: itemsCode },
    { key: "danger", label: "Sil öğesi (tehlikeli)", default: true, prop: "items", toProp: (_x, v) => itemsOf(v), toCode: itemsCode },
    { key: "label", label: "Erişilebilir ad", default: "Dosya işlemleri", kind: "text" },
    { key: "cardsOnly", label: "Yalnız kartlarda aç (when)", default: false, prop: "when",
      toProp: (on) => (on ? (t: Element) => !!t.closest("[data-card]") : undefined), toCode: (on) => (on ? `{(t) => !!t.closest("[data-card]")}` : null) },
    { key: "area", label: "Alan", default: "cards", options: [{ value: "cards", label: "dosya kartları" }, { value: "text", label: "metin" }], prop: "children",
      toProp: (a) => (a === "text" ? para() : el("div", "sc-row", ...FILES.map(card))),
      toCode: (a) => (a === "text" ? "<p>Bu paragrafa sağ tıklayın.</p>" : "{cards}") },
  ],
};
export default spec;
