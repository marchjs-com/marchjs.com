import { definePlayground } from "../../spec.ts";

/** Title and body of the sample alert, by tone (the demo draws them, the generated code writes them). */
export const TEXT: Record<string, [string, string]> = {
  info: ["Bakım penceresi", "Pazar 03:00–03:30 arası ödeme sağlayıcısı bakımda."],
  success: ["Yayında", "Domain doğrulandı, SSL sertifikası yüklendi."],
  warn: ["Kota", "Bu ay depolamanın %90'ı kullanıldı."],
  danger: ["Ödeme başarısız", "Kart reddedildi. Başka bir kart deneyin."],
  neutral: ["Not", "Değişiklikler bir sonraki girişte geçerli olur."],
}
const text = (tone: string): [string, string] => TEXT[tone] ?? TEXT.info!

interface Values { action: boolean; actionPlacement: string; tone: string; color: string; icon: string; title: boolean; body: string; variant: string; dismissable: boolean; dismissIcon: string }

export default definePlayground<Values>({
  code: { children: (v) => text(v.tone)[1] },
  options: [
    { key: "tone", label: "Ton", default: "info", kind: "cards", options: [{ value: "info", label: "bilgi" }, { value: "success", label: "başarı" }, { value: "warn", label: "uyarı" }, { value: "danger", label: "tehlike" }, { value: "neutral", label: "nötr" }] },
    { key: "color", label: "Renk", default: "tone", kind: "chips", options: [{ value: "tone", label: "tonun rengi" }, { value: "brand-purple", label: "mor" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }], toCode: { tone: null }, prop: "m:color" },
    // "": the tone's icon (MarchIDE shows an icon picker for this option: its value is an icon's name)
    { key: "icon", label: "İkon", default: "", kind: "segmented", options: [{ value: "", label: "tonun ikonu" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }], toCode: { "": null, own: "{sparkles}", off: "{null}" } },
    { key: "title", label: "Başlık", default: true, toCode: (on, v) => (on ? JSON.stringify(text(v.tone)[0]) : null), fromCode: (a) => "title" in a },
    // the message as the body prop; empty: the card's sample text of the tone (written as children)
    { key: "body", label: "Mesaj (body)", default: "", kind: "text", toCode: (x) => (x ? JSON.stringify(String(x)) : null) },
    { key: "action", label: "Eylem düğmesi", default: true, toCode: { true: "{<Button size=\"sm\">Yeniden dene</Button>}", false: null } },
    { key: "actionPlacement", label: "Eylemin yeri", default: "end", kind: "segmented", options: [{ value: "end", label: "metnin yanında" }, { value: "below", label: "metnin altında" }], visibleWhen: (v) => v.action, toCode: { end: null } },
    { key: "variant", label: "Görünüm", default: "soft", kind: "segmented", options: [{ value: "soft", label: "renkli zemin" }, { value: "raised", label: "yüzen (gölgeli)" }], toCode: { soft: null } },
    { key: "dismissable", label: "Kapatılabilir", default: true, toCode: { true: "", false: null } },
    { key: "dismissIcon", label: "Kapat düğmesi", default: "x", kind: "segmented", options: [{ value: "x", label: "çarpı" }, { value: "check", label: "onay işareti" }], visibleWhen: (v) => v.dismissable, toCode: { x: null, check: "{check}" } },
  ],
});
