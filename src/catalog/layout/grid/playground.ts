import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { cols: number; count: number; fill: string; balance: boolean }

export default definePlayground<Values>({
  options: [
    { key: "cols", label: "Sütun", default: 4, options: [2, 3, 4, 5, 6] },
    { key: "count", label: "Kart sayısı", default: 6, min: 1, max: 14, prop: "children",
      // MarchIDE: the bare Grid gets this many sample cards
      toProp: (n) => Array.from({ length: Number(n) }, (_, i) => el("div", "sc-tile", el("span", "", `Kart ${i + 1}`))), toCode: (n) => `{cards.slice(0, ${String(n)})}` },
    { key: "fill", label: "Son satır", default: "stretch", options: [{ value: "", label: "hizalı" }, { value: "stretch", label: "paylaş" }, { value: "last", label: "son kart uzar" }] },
    { key: "balance", label: "Dengele", default: false },
  ],
});
