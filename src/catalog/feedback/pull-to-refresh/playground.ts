import { definePlayground } from "../../spec.ts";

interface Values { children: string; threshold: number; delay: number; indicator: string; icon: string; color: string; settle: boolean; refreshButton: boolean; disabled: boolean }

export default definePlayground<Values>({
  options: [
    // MarchIDE's raw <PullToRefresh /> scrolls this text (without onRefresh it spins briefly)
    { key: "children", label: "İçerik", default: "Listeyi yenilemek için aşağı çekin", kind: "text" },
    { key: "threshold", label: "Eşik", default: 72, min: 40, max: 140, step: 4, unit: "px" },
    { key: "indicator", label: "Gösterge", default: "on", kind: "cards", options: [{ value: "on", label: "hazır (dönen ikon)" }, { value: "own", label: "kendi içeriğim (oklar)" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{(phase) => <Icon of={phase === \"ready\" ? arrowUp : arrowDown} />}", off: "{false}" } },
    { key: "icon", label: "Dönen ikon", default: "refresh", options: ["refresh", "sparkles", "hourglass", "rotateCw"], toCode: (x) => `{${String(x)}}`, visibleWhen: (v) => v.indicator === "on" },
    { key: "color", label: "Gösterge rengi", default: "", kind: "chips", options: [{ value: "", label: "birincil" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], visibleWhen: (v) => v.indicator !== "off", prop: "m:color" },
    { key: "settle", label: "Geri yaylanma hareketi", default: true, toCode: { true: null, false: "{false}" } },
    { key: "refreshButton", label: "Klavye düğmesi (odakta)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "disabled", label: "Kapalı", default: false },
    // the showcase card's own: how long its refresh takes (onRefresh is a function)
    { key: "delay", label: "Yenileme süresi", default: 1200, min: 200, max: 4000, step: 100, unit: "ms", prop: false },
  ],
});
