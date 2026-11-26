import { definePlayground } from "../../spec.ts";
// the masks of the mask picker: what the demo and MarchIDE's raw component get, and what the code writes. The playground
// specs load with every component page, so march/mask stays out of them: a picked mask is a dynamic mask (a function
// of the raw value) that uses a plain pattern until the presets have loaded on first use, then the real preset.
type Presets = typeof import("march/mask/presets");
type MaskMod = typeof import("march/mask");
let mods: { p: Presets; m: MaskMod } | null = null;
let loading: Promise<void> | null = null;
const load = (): Promise<void> => (loading ??= Promise.all([import("march/mask/presets"), import("march/mask")]).then(([p, m]) => { mods = { p, m }; }));
export const MASKS: Record<string, { label: string; code: string; make: (p: Presets, m: MaskMod) => unknown; first: string }> = {
  phone: { label: "telefon", code: "{phoneTR()}", make: (p) => p.phoneTR(), first: "(999) 999 99 99" },
  card: { label: "kart", code: "{cardNumber()}", make: (p) => p.cardNumber(), first: "9999 9999 9999 9999[999]" },
  expiry: { label: "AA/YY", code: "{cardExpiry()}", make: (p) => p.cardExpiry(), first: "99/99" },
  iban: { label: "IBAN", code: '{iban({ country: "TR" })}', make: (p) => p.iban({ country: "TR" }), first: "TR99 9999 9999 9999 9999 9999 99" },
  date: { label: "tarih", code: "{date()}", make: (_p, m) => m.date(), first: "99.99.9999" },
  money: { label: "tutar", code: '{money({ currency: "TRY" })}', make: (p) => p.money({ currency: "TRY" }), first: "9{1,12}" },
  plate: { label: "plaka", code: "{plateTR()}", make: (p) => p.plateTR(), first: "99 A[AA] 99[99]" },
  pattern: { label: "desen", code: '"(999) 999 99 99"', make: () => "(999) 999 99 99", first: "(999) 999 99 99" },
  code: { label: "kod", code: "{licenseKey({ groups: 3, size: 4 })}", make: (p) => p.licenseKey({ groups: 3, size: 4 }), first: "****-****-****" },
};
const made = new Map<string, unknown>(), specs = new Map<string, (raw: string) => unknown>();
/** The mask of a picker value: one stable function per value (the TextInput compiles it once). */
export const maskOf = (k: string): unknown => {
  const e = MASKS[k];
  if (!e) return undefined;
  void load();
  let f = specs.get(k);
  if (!f) specs.set(k, (f = () => { if (!mods) return e.first; let m = made.get(k); if (!m) made.set(k, (m = e.make(mods.p, mods.m))); return m; }));
  return f;
};

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
