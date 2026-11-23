import { definePlayground } from "../../spec.ts";

interface Values { watch: boolean; scope: boolean; stack: boolean; breakpoints: boolean; output: boolean; timeline: boolean; options: boolean; depth: number; side: boolean; outputLines: number; ownLabels: boolean; ownIcons: boolean }

// the five section switches write one prop: the list of the sections that are on (each writes the same list)
const SECTIONS = ["watch", "scope", "stack", "breakpoints", "output"] as const;
const sections = (_x: unknown, v: Values): string => `{${JSON.stringify(SECTIONS.filter((k) => v[k] !== false))}}`;
// the card's own texts (demo.tsx OWN): a few of them, as an object literal
const OWN = { title: "Böcek avı", resume: "Sürdür", over: "Atla", into: "Gir", out: "Çık", back: "Geri sar", stop: "Bitir", watch: "Gözlem", scope: "Değişkenler", stack: "Yığın", breakpoints: "Duraklar", output: "Günlük" };

export default definePlayground<Values>({
  options: [
    { key: "watch", label: "İzlenenler bölümü", default: true, prop: "sections", toCode: sections },
    { key: "scope", label: "Kapsam bölümü", default: true, prop: "sections", toCode: sections },
    { key: "stack", label: "Çağrı yığını bölümü", default: true, prop: "sections", toCode: sections },
    { key: "breakpoints", label: "Kesme noktaları bölümü", default: true, prop: "sections", toCode: sections },
    { key: "output", label: "Çıktı bölümü", default: true, prop: "sections", toCode: sections },
    { key: "timeline", label: "Zaman çizelgesi", default: true },
    { key: "options", label: "Anahtarlar (hatada dur…)", default: true },
    { key: "side", label: "Bölümler yan yana (sürüklenen ayırıcı)", default: true, prop: "layout", toCode: { true: null, false: `{${JSON.stringify(SECTIONS)}}` } },
    { key: "outputLines", label: "Çıktı satırı", default: 4, options: [{ value: 2, label: "2" }, { value: 4, label: "4" }, { value: 8, label: "8" }], visibleWhen: (v) => v.output },
    { key: "depth", label: "Değerlerin açık derinliği", default: 0, options: [{ value: 0, label: "kapalı" }, { value: 1, label: "1" }, { value: 2, label: "2" }] },
    { key: "ownLabels", label: "Kendi metinlerim", default: false, prop: "labels", toCode: { true: `{${JSON.stringify(OWN)}}`, false: null } },
    // in MarchIDE the own icons are glyphs (the card draws sparkles and a star)
    { key: "ownIcons", label: "Kendi ikonlarım", default: false, prop: "icons", toCode: { true: `{${JSON.stringify({ resume: "★", stop: "■", back: "⏪" })}}`, false: null } },
  ],
});
