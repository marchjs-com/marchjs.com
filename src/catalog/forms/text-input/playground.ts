import { definePlayground } from "../../spec.ts";
import { cardNumber, iban, phoneTR, money, plateTR, licenseKey, cardExpiry } from "march/mask/presets";
import { date } from "march/mask";

// the masks of the mask picker: what the demo and MarchIDE's raw component get, and what the code writes
export const MASKS: Record<string, { label: string; code: string; make: () => unknown }> = {
  phone: { label: "telefon", code: "{phoneTR()}", make: phoneTR },
  card: { label: "kart", code: "{cardNumber()}", make: cardNumber },
  expiry: { label: "AA/YY", code: "{cardExpiry()}", make: cardExpiry },
  iban: { label: "IBAN", code: '{iban({ country: "TR" })}', make: () => iban({ country: "TR" }) },
  date: { label: "tarih", code: "{date()}", make: () => date() },
  money: { label: "tutar", code: '{money({ currency: "TRY" })}', make: () => money({ currency: "TRY" }) },
  plate: { label: "plaka", code: "{plateTR()}", make: plateTR },
  pattern: { label: "desen", code: '"(999) 999 99 99"', make: () => "(999) 999 99 99" },
  code: { label: "kod", code: "{licenseKey({ groups: 3, size: 4 })}", make: () => licenseKey({ groups: 3, size: 4 }) },
};
const made = new Map<string, unknown>();
export const maskOf = (k: string): unknown => { if (!MASKS[k]) return undefined; let m = made.get(k); if (!m) made.set(k, (m = MASKS[k]!.make())); return m; };

type V = { kind: string; prefix: string; placeholder: string; disabled: boolean; readonly: boolean; error: boolean; mask: string; maskPlaceholder: string; maskValue: string; maskMotion: boolean; maskDone: boolean };
const masked = (v: V): boolean => v.mask !== "none";

export default definePlayground<V>({
  code: { tag: (v) => (v.kind === "email" && !masked(v) ? "EmailInput" : v.kind === "url" && !masked(v) ? "UrlInput" : "TextInput"), props: { "bind:value": "{$text}" }, root: "input" },
  options: [
    // the mask picker: a preset of march/mask/presets or a pattern; none: a plain text input
    { key: "mask", label: "Maske (mask)", default: "none", kind: "chips", options: [{ value: "none", label: "yok" }, ...Object.entries(MASKS).map(([value, m]) => ({ value, label: m.label }))],
      toCode: (m) => (m === "none" ? null : MASKS[m as string]?.code ?? null), toProp: (m) => maskOf(m as string) },
    { key: "maskPlaceholder", label: "Şablon", default: "lazy", options: [{ value: "lazy", label: "yazdıkça" }, { value: "eager", label: "tümü" }, { value: "ghost", label: "hayalet" }], visibleWhen: masked },
    { key: "maskValue", label: "Değer", default: "raw", options: [{ value: "raw", label: "ham" }, { value: "masked", label: "maskeli" }, { value: "parsed", label: "ayrıştırılmış" }], visibleWhen: masked },
    { key: "maskMotion", label: "Animasyonlar", default: true, visibleWhen: masked, toCode: { true: null, false: "{false}" } },
    { key: "maskDone", label: "Onay işareti", default: true, visibleWhen: masked, toCode: { true: null, false: "{false}" } },
    // the raw TextInput takes it as `type` (EmailInput / UrlInput set it themselves)
    { key: "kind", label: "Tür", default: "text", options: [{ value: "text", label: "metin" }, { value: "email", label: "e-posta" }, { value: "url", label: "web adresi" }], prop: "type",
      toCode: { text: null, email: '"email"', url: '"url"' }, visibleWhen: (v) => !masked(v) },
    { key: "prefix", label: "Ön ek", default: "icon", options: [{ value: "none", label: "yok" }, { value: "icon", label: "ikon" }, { value: "text", label: "metin" }],
      toCode: (p, v) => (p === "none" ? null : p === "icon" ? `{<Icon of={${v.kind === "url" ? "globe" : "search"}} />}` : v.kind === "url" ? '"www"' : '"@"') },
    { key: "placeholder", label: "Yer tutucu", default: "Üye, sipariş, etiket…", kind: "text", visibleWhen: (v) => !masked(v) },
    { key: "disabled", label: "Devre dışı", default: false },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "error", label: "Hata metni (error)", default: false, toCode: { true: '"Bu alan boş bırakılamaz."', false: null } },
  ],
});
