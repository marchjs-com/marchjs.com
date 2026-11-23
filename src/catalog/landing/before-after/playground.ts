import { definePlayground } from "../../spec.ts";

interface Values { before: string; after: string; orientation: string; follow: boolean; beforeLabel: string; afterLabel: string; grip: string; hint: boolean; value: number }

export default definePlayground<Values>({
  options: [
    // before / after are required: the raw component in MarchIDE draws these texts as two filled layers
    { key: "before", label: "Önceki katman (before)", default: "Eski tasarım", kind: "text" },
    { key: "after", label: "Sonraki katman (after)", default: "Yeni tasarım ✨", kind: "text" },
    { key: "orientation", label: "Yön", default: "horizontal", options: [{ value: "horizontal", label: "yatay" }, { value: "vertical", label: "dikey" }] },
    { key: "follow", label: "İmleci izle", default: false },
    { key: "beforeLabel", label: "Önceki etiket", default: "Önce", kind: "text" },
    { key: "afterLabel", label: "Sonraki etiket", default: "Sonra", kind: "text" },
    { key: "grip", label: "Tutamaç", default: "arrows", options: [{ value: "arrows", label: "oklar" }, { value: "own", label: "kendi simgem" }, { value: "off", label: "yalnız çizgi" }], toCode: { arrows: null, own: "{<Icon of={heart} />}", off: "{false}" } },
    { key: "hint", label: "İlk görünüşte salınım", default: true, toCode: { true: null, false: "{false}" } },
    { key: "value", label: "Konum", default: 50, min: 0, max: 100, step: 1 },
  ],
});
