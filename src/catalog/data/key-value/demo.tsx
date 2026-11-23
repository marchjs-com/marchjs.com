// Showcase stage for KeyValue: the rows (JSON), columns, the empty text, and the card's hints and empty note follow the Playground values (playground.ts).
import { KeyValue, type KeyValueItem } from "march/components/data/key-value";
import { ITEMS } from "./playground.ts";

export const code = `<KeyValue columns={2} items={[
  { label: "Müşteri", value: "HADİ" },
  { label: "Tutar", value: "1.499,90 ₺", hint: "KDV dahil" },
  { label: "Not", value: "" },                          // shows "—"
]} />
<KeyValue items={{ Plan: "Kurumsal", Koltuk: 48 }} />  // an object works too`

const parse = (json: string): KeyValueItem[] | Record<string, unknown> => { try { const x = JSON.parse(json); return x && typeof x === "object" ? x : [] } catch { return [] } }

export default function KeyValueDemo(props: { values: { items: string; columns: number; empty: string; hint: boolean; blank: boolean } }) {
  return <div class="sc-col">
    {() => {
      const v = props.values
      const rows = parse(v.items || ITEMS)
      const items = Array.isArray(rows) ? rows.map((x) => ({ ...x, hint: v.hint ? x.hint : undefined, value: !v.blank && x.value === "" ? "Kapıya bırakılabilir" : x.value })) : rows
      return <KeyValue columns={v.columns} empty={v.empty || undefined} items={items} />
    }}
  </div>
}
