// type-only import: the spec is plain data (its page imports it without the shared component chunk)
import type { PlaygroundSpec } from "../../spec.ts";

interface Values { timeline: boolean; step: boolean; reset: boolean; speed: boolean; status: boolean; labels: boolean }

const spec: PlaygroundSpec<Values> = {
  options: [
    { key: "timeline", label: "Zaman çizelgesi", default: true },
    { key: "step", label: "Adım düğmesi", default: true },
    { key: "reset", label: "Sıfırla düğmesi", default: true },
    { key: "speed", label: "Hız seçimi", default: true },
    { key: "status", label: "Durum, süre ve sayaç", default: true },
    { key: "labels", label: "Kendi metinlerim", default: false },
  ],
};
export default spec;
