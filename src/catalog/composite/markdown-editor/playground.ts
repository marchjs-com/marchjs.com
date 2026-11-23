import { definePlayground } from "../../spec.ts";

interface Values { view: string; toolbar: boolean; sync: boolean; stats: boolean; rich: boolean; readonly: boolean; tools: string; hint: boolean; labels: boolean }

export default definePlayground<Values>({
  options: [
    { key: "view", label: "İlk görünüm", default: "split", kind: "segmented", options: [{ value: "write", label: "yaz" }, { value: "preview", label: "önizle" }, { value: "split", label: "böl" }, { value: "rich", label: "zengin" }] },
    { key: "toolbar", label: "Araç çubuğu", default: true, visibleWhen: (v) => v.view === "write" || v.view === "split", toCode: { false: "{false}" } },
    { key: "tools", label: "Araçlar", default: "all", kind: "segmented", options: [{ value: "all", label: "tümü" }, { value: "short", label: "kalın, italik, bağlantı, liste" }], visibleWhen: (v) => v.toolbar && (v.view === "write" || v.view === "split"),
      prop: "toolbar", toCode: { all: null, short: '{["bold","italic","|","link","ul"]}' } },
    { key: "sync", label: "Eşzamanlı kaydırma", default: true, visibleWhen: (v) => v.view === "split", prop: "syncScroll", toCode: { false: "{false}" } },
    { key: "stats", label: "Kelime ve okuma süresi", default: true, toCode: { false: "{false}" } },
    { key: "hint", label: "Sözdizimi hatırlatması", default: true, visibleWhen: (v) => v.stats && v.view !== "rich", toCode: { false: "{false}" } },
    { key: "labels", label: "Kendi metinlerim (sekmeler, sayaç)", default: false, toCode: { true: '{{"write":"Taslak","preview":"Oku","split":"Yan yana","rich":"Biçimli"}}', false: null } },
    { key: "rich", label: "Zengin görünüm sekmesi", default: true, visibleWhen: (v) => v.view !== "rich", prop: "views", toCode: { true: null, false: '{["write","preview","split"]}' } },
    { key: "readonly", label: "Salt okunur", default: false },
  ],
});
