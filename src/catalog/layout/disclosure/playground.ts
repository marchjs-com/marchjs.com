import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { title: string; open: boolean; marker: string; content: string }

export default definePlayground<Values>({
  options: [
    // title is required: the bare component in MarchIDE gets this default
    { key: "title", label: "Başlık (title)", default: "Gelişmiş ayarlar", kind: "text" },
    { key: "open", label: "Açık başlar", default: true },
    { key: "marker", label: "Ok", default: "arrow", options: [{ value: "arrow", label: "ok" }, { value: "own", label: "kendi işaretim" }, { value: "off", label: "yok" }],
      toProp: (x) => (x === "off" ? false : x === "own" ? el("span", "", "⚙") : true), toCode: { arrow: null, own: "{<Icon of={settings} />}", off: "{false}" } },
    { key: "content", label: "İçerik", default: "Önbellek süresi 10 dakika; günlük kayıtları 30 gün saklanır.", kind: "text", prop: "children" },
  ],
});
