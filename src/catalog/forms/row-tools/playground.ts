import { definePlayground } from "../../spec.ts";

interface Values { actions: string; size: string; danger: boolean; disabled: boolean }

// every option writes a real prop of RowTools: `actions` as a string of names (the preview takes literals only)
export default definePlayground<Values>({
  options: [
    { key: "actions", label: "Araçlar", default: "drag", options: [{ value: "drag", label: "sürükle, yukarı, aşağı, sil" }, { value: "all", label: "yukarı, aşağı, sil" }, { value: "move", label: "yalnız taşıma" }, { value: "remove", label: "yalnız sil" }],
      toCode: { drag: '"drag up down remove"', all: null, move: '"up down"', remove: '"remove"' } },
    { key: "size", label: "Boyut", default: "sm", options: ["xs", "sm", "md"] },
    { key: "danger", label: "Sil kırmızı", default: false, visibleWhen: (v) => v.actions !== "move" },
    { key: "disabled", label: "Hepsi kapalı", default: false },
  ],
});
