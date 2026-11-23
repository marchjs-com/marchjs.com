import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { direction: string; gap: number; align: string; wrap: boolean; items: number }

export const STACK_ITEMS = ["Tasarım", "Geliştirme ve test", "Yayın", "Destek", "Pazarlama", "Satış ve iş ortaklıkları", "Finans"];

export default definePlayground<Values>({
  options: [
    { key: "direction", label: "Yön", default: "row", options: [{ value: "row", label: "satır" }, { value: "column", label: "sütun" }] },
    { key: "gap", label: "Boşluk", default: 3, min: 0, max: 8 },
    { key: "align", label: "Hizalama", default: "center", options: ["start", "center", "end", "stretch"] },
    { key: "wrap", label: "Satır kaydır", default: true, visibleWhen: (v) => v.direction === "row" },
    // MarchIDE: the bare Stack gets this many sample items
    { key: "items", label: "Öğe sayısı", default: 7, min: 1, max: 7, prop: "children",
      toProp: (n) => STACK_ITEMS.slice(0, Number(n)).map((x, i) => el("span", `sc-stack-item sc-stack-item-${i % 3}`, x)), toCode: (n) => `{items.slice(0, ${String(n)})}` },
  ],
});
