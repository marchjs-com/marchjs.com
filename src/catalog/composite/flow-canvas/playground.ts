// type-only import: the spec is plain data (its page imports it without the shared component chunk)
import type { PlaygroundSpec } from "../../spec.ts";

interface Values { snap: number; minimap: boolean; tool: string; fields: boolean; controls: string; motion: boolean }

const spec: PlaygroundSpec<Values> = {
  options: [
    { key: "tool", label: "Boş alanda sürükle", default: "select", options: [{ value: "select", label: "seçim kutusu" }, { value: "pan", label: "kaydır" }] },
    { key: "snap", label: "Izgaraya yapış", default: 16, options: [{ value: 0, label: "kapalı" }, { value: 16, label: "16" }, { value: 32, label: "32" }] },
    { key: "minimap", label: "Mini harita", default: true },
    { key: "fields", label: "Düğüm içi alanlar", default: true },
    { key: "controls", label: "Yakınlaştırma çubuğu", default: "all", options: [{ value: "all", label: "tümü" }, { value: "zoom", label: "yalnız − % +" }, { value: "none", label: "yok" }] },
    { key: "motion", label: "Hareket (otomatik yerleşim, kenar çizimi)", default: true },
  ],
};
export default spec;
