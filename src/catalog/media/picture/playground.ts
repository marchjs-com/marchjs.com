import { definePlayground } from "../../spec.ts";

interface Values { source: string; kind: string; fit: string; loading: string; broken: boolean }

// the picture object: MarchIDE's raw <Picture /> gets this JSON as its source
export const SOURCE = JSON.stringify({ src: "/media/dusk.jpg", alt: "Gün batımında tepeler", width: 1200, height: 800 });

export default definePlayground<Values>({
  options: [
    { key: "source", label: "Resim nesnesi (source, JSON)", default: SOURCE, kind: "json", toCode: (x) => `{${String(x)}}`, visibleWhen: (v) => v.kind !== "node" },
    // the card's own: the same slot fed with a ready node instead of the object
    { key: "kind", label: "Kaynak", default: "object", options: [{ value: "object", label: "resim nesnesi" }, { value: "node", label: "hazır düğüm" }], prop: false },
    { key: "fit", label: "Sığdırma", default: "cover", options: [{ value: "cover", label: "kapla" }, { value: "contain", label: "sığdır" }, { value: "natural", label: "doğal boyut" }], visibleWhen: (v) => v.kind !== "node", toCode: { natural: null } },
    { key: "loading", label: "Yükleme", default: "lazy", options: [{ value: "lazy", label: "tembel" }, { value: "eager", label: "hemen (ilk ekran)" }], visibleWhen: (v) => v.kind !== "node" },
    { key: "broken", label: "Bozuk adres (yedek içerik)", default: false, visibleWhen: (v) => v.kind !== "node", prop: false },
  ],
});
