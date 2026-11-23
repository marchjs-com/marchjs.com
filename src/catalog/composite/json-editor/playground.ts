import { definePlayground } from "../../spec.ts";

interface Values { data: string; mode: string; schema: boolean; readonly: boolean; switcher: boolean; format: boolean; status: boolean; labels: boolean }

// the samples and the schema as JSON: MarchIDE gives them to the raw component (toCode), the card's demo has the same
export const SAMPLES: Record<string, unknown> = {
  flags: { version: "1.4", theme: "hadi", features: { search: true, export: false, beta: "yes" } },
  clean: { version: "1.4.0", theme: "dark", features: { search: true, export: true } },
};
export const SCHEMA = {
  type: "object", required: ["version", "features"],
  properties: { version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" }, features: { type: "object", additionalProperties: { type: "boolean" } }, theme: { enum: ["hadi", "light", "dark"] } },
};
const json = (x: unknown): string => `{${JSON.stringify(x)}}`;

export default definePlayground<Values>({
  options: [
    { key: "data", label: "Veri", default: "flags", kind: "segmented", options: [{ value: "flags", label: "sorunlu ayarlar" }, { value: "clean", label: "temiz ayarlar" }],
      prop: "value", toCode: (x) => json(SAMPLES[String(x)]) },
    { key: "mode", label: "İlk görünüm", default: "tree", kind: "segmented", options: [{ value: "tree", label: "ağaç" }, { value: "text", label: "metin" }] },
    { key: "schema", label: "Şema doğrulaması", default: true, toCode: { true: json(SCHEMA), false: null } },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "switcher", label: "Görünüm sekmeleri", default: true, prop: "modes", toCode: (x, v) => (x ? null : json([v.mode])) },
    { key: "format", label: "Biçimlendir düğmesi (metin görünümü)", default: true, visibleWhen: (v) => !v.readonly, toCode: { false: "{false}" } },
    // the "valid" line shows only while there is no problem to report: with the schema on, the first sample has one
    { key: "status", label: "\"Geçerli JSON\" satırı (metin görünümü, sorun yokken)", default: true, visibleWhen: (v) => !v.schema || v.data === "clean", toCode: { false: "{false}" } },
    { key: "labels", label: "Kendi metinlerim", default: false, toCode: { true: json({ text: "Kaynak", tree: "Ana hat", format: "Toparla", valid: "Sorun yok" }), false: null } },
  ],
});
