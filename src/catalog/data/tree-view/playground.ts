import { definePlayground } from "../../spec.ts";

interface Values { nodes: string; expanded: string; label: string; search: string; selection: string; draggable: boolean; icons: boolean; load: string; chevron: string; color: string; animate: boolean; labels: boolean }

// nodes is required: MarchIDE's raw <TreeView /> gets this small project tree (kind "json"); the showcase card builds
// ~3 000 nodes of its own after these; a lazy folder ("eski") loads with the card's load
const file = (dir: string, name: string, kb: number) => ({ id: dir ? `${dir}/${name}` : name, label: name, meta: `${kb} KB` });
export const NODES = JSON.stringify([
  { id: "web", label: "web", children: [
    { id: "web/parts", label: "bileşenler", children: [{ id: "web/parts/old", label: "eski", lazy: true }, file("web/parts", "kart.tsx", 4), file("web/parts", "menü.tsx", 6), file("web/parts", "ödeme.tsx", 9)] },
    { id: "web/pages", label: "sayfalar", children: [file("web/pages", "giriş.tsx", 3), file("web/pages", "profil.tsx", 5)] },
  ] },
  { id: "api", label: "api", children: [file("api", "sunucu.ts", 12), file("api", "veri.json", 2)] },
  file("", "README.md", 1),
]);

export default definePlayground<Values>({
  options: [
    { key: "nodes", label: "Düğümler (nodes, JSON)", default: NODES, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "expanded", label: "Başta açık (expanded, JSON)", default: '["web","web/parts","web/parts/old"]', kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "label", label: "Ad (label)", default: "Proje dosyaları", kind: "text" },
    { key: "search", label: "Arama (search)", default: "", kind: "text" },
    { key: "selection", label: "Seçim", default: "multiple", options: [{ value: "single", label: "tek" }, { value: "multiple", label: "çoklu" }, { value: "none", label: "yok" }] },
    { key: "draggable", label: "Sürükle-bırak", default: true },
    { key: "icons", label: "İkonlar", default: true },
    { key: "chevron", label: "Açma oku", default: "on", options: [{ value: "on", label: "ok" }, { value: "own", label: "kendi işaretim (+ / −)" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{(node, open) => <b>{open ? \"−\" : \"+\"}</b>}", off: "{false}" } },
    { key: "color", label: "Seçim rengi", default: "", options: [{ value: "", label: "vurgu rengi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], prop: "m:color" },
    { key: "animate", label: "Açılma hareketi", default: true },
    // the showcase card's own: how its lazy folders load (load is a function) and its own texts
    { key: "load", label: "Tembel klasörler", default: "slow", options: [{ value: "fast", label: "hızlı" }, { value: "slow", label: "yavaş" }, { value: "fail", label: "hata" }], prop: false },
    { key: "labels", label: "Kendi metinlerim (boş arama, yeniden dene)", default: false, prop: false },
  ],
});
