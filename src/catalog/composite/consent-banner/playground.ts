import { definePlayground } from "../../spec.ts";

interface Values { title: string; wording: string; buttons: string; customize: boolean; inline: boolean; always: boolean }

/** The banner text for each "Metin" choice. */
export const TEXT: Record<string, string> = {
  short: "Ziyaretleri ölçmek için analitik kullanıyoruz.",
  long: "Gerekli çerezler her zaman açık. Analitik ve üçüncü taraf içerik (video, harita) yalnız izninizle yüklenir; tercihinizi her zaman değiştirebilirsiniz.",
};
/** Own button texts ("kendi metinlerim"): the banner's three buttons and the ConsentGate's two. */
export const OWN = { reject: "Hayır, teşekkürler", customize: "Kendim seçeyim", accept: "Tamam, olur", allow: "İçeriği göster", preferences: "Ayarlar" };

// every option writes a real prop of the raw component: wording → `text`, button texts → `labels`; `inline` and
// `always` (both on here) draw the banner in the preview's flow even when a decision is already stored
export default definePlayground<Values>({
  options: [
    { key: "title", label: "Başlık", default: "Çerezler", kind: "text" },
    { key: "wording", label: "Metin", default: "short", options: [{ value: "short", label: "kısa" }, { value: "long", label: "ayrıntılı" }], prop: "text",
      toProp: (w) => TEXT[w as string] ?? TEXT["short"], toCode: (w) => TEXT[w as string] ?? TEXT["short"]! },
    { key: "buttons", label: "Düğme metinleri", default: "default", options: [{ value: "default", label: "hazır metinler" }, { value: "own", label: "kendi metinlerim" }], prop: "labels",
      toProp: (b) => (b === "own" ? OWN : undefined), toCode: (b) => (b === "own" ? `{${JSON.stringify(OWN)}}` : null) },
    { key: "customize", label: "Özelleştir düğmesi", default: true },
    { key: "inline", label: "Sayfa akışında (inline)", default: true },
    { key: "always", label: "Karar varken de göster (always)", default: true },
  ],
});
