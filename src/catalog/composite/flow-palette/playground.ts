// type-only import: the spec is plain data (its page imports it without the shared component chunk)
import type { PlaygroundSpec } from "../../spec.ts";

interface Values { search: boolean; set: string; categories: boolean; descriptions: boolean; grip: boolean; card: string; labels: boolean }

const spec: PlaygroundSpec<Values> = {
  options: [
    { key: "set", label: "Türler", default: "all", options: [{ value: "all", label: "hepsi" }, { value: "actions", label: "yalnız eylemler" }, { value: "logic", label: "yalnız mantık" }] },
    { key: "search", label: "Arama kutusu", default: true },
    { key: "categories", label: "Kategori başlıkları", default: true },
    { key: "card", label: "Kart içeriği", default: "default", options: [{ value: "default", label: "hazır" }, { value: "own", label: "kendi içeriğim" }] },
    { key: "descriptions", label: "Açıklama satırı", default: true, visibleWhen: (v) => v.card === "default" },
    { key: "grip", label: "Tutamaç noktaları", default: true },
    { key: "labels", label: "Kendi metinlerim (arama kutusu)", default: false, visibleWhen: (v) => v.search },
  ],
};
export default spec;
