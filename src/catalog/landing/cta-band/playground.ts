import { definePlayground } from "../../spec.ts";

interface Values { sample: number; sampleVideo: boolean; title: string; lead: string; note: string; variant: string; align: string; backdrop: boolean; reveal: string }

// sample actions and video for the raw component in MarchIDE (plain JSON; the first action is primary)
const SAMPLE = [{ label: "HADİ'ye katıl", href: "#katil" }, { label: "Etkinliklere göz at", href: "#etkinlikler" }];
const VIDEO = { src: "/media/hadi-waves.webm", poster: "/media/hadi-waves.jpg" };

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample actions: an actions array cannot come from a slider
    { key: "sample", label: "Örnek eylemler", default: 2, min: 0, max: 2, step: 1, prop: "actions", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    // title is required: the raw component in MarchIDE gets these defaults
    { key: "title", label: "Başlık (title)", default: "Bu hafta sonu bir plan yap", kind: "text" },
    { key: "lead", label: "Açıklama (lead)", default: "Yakınındaki etkinliklere katıl ya da kendi buluşmanı kur.", kind: "text" },
    { key: "note", label: "Alt not (note)", default: "Ücretsiz · Premium isteğe bağlı", kind: "text" },
    { key: "variant", label: "Arka plan", default: "gradient", options: [{ value: "gradient", label: "gradyan" }, { value: "mesh", label: "ağ" }, { value: "glass", label: "cam" }, { value: "plain", label: "sade" }, { value: "video", label: "video" }] },
    // the video variant needs a { src, poster } object: a sample clip of the showcase
    { key: "sampleVideo", label: "Örnek video", default: true, prop: "video", toCode: (x) => (x ? `{${JSON.stringify(VIDEO)}}` : null), visibleWhen: (v) => v.variant === "video" },
    { key: "align", label: "Hiza", default: "center", options: [{ value: "center", label: "orta" }, { value: "start", label: "baş" }] },
    { key: "backdrop", label: "Arka plan katmanları", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.variant !== "video" },
    { key: "reveal", label: "Giriş hareketi", default: "scale", options: [{ value: "scale", label: "büyüme" }, { value: "up", label: "aşağıdan" }, { value: "blur", label: "netleşme" }, { value: "flip", label: "dönüş" }, { value: "none", label: "yok" }] },
  ],
});
