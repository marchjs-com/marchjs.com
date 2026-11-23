import { definePlayground } from "../../spec.ts";

interface Values { private: boolean; size: string; block: boolean; labels: string; icon: string; color: string; burst: boolean; morph: boolean; state: string }

export default definePlayground<Values>({
  options: [
    // state is required: the bare FollowButton in MarchIDE starts in this state
    { key: "state", label: "Durum (state)", default: "follow", options: [{ value: "follow", label: "takip et" }, { value: "following", label: "takip ediliyor" }, { value: "requested", label: "istek gönderildi" }] },
    { key: "private", label: "Gizli hesap (istek)", default: false },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md"] },
    { key: "block", label: "Tam genişlik", default: false },
    { key: "labels", label: "Metinler", default: "default", options: [{ value: "default", label: "Takip et / Takip ediliyor" }, { value: "own", label: "kendi metnim (Katıl / Üyesin)" }], toProp: (x) => (x === "own" ? { follow: "Katıl", following: "Üyesin", requested: "Onay bekliyor" } : undefined), toCode: { default: null, own: '{{ follow: "Katıl", following: "Üyesin" }}' } },
    { key: "icon", label: "İkon", default: "on", options: [{ value: "on", label: "+ / tik" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }], toProp: (x) => (x === "off" ? false : x === "own" ? (s: string) => (s === "follow" ? "✦" : "★") : true), toCode: { on: null, own: "{(s) => <Icon of={s === \"follow\" ? sparkles : star} />}", off: "{false}" } },
    { key: "color", label: "Renk", default: "brand-blue", options: [{ value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }, { value: "brand-orange", label: "turuncu" }], prop: "m:color" },
    { key: "burst", label: "Patlama", default: true, visibleWhen: (v) => !v.private },
    { key: "morph", label: "Geçiş hareketi", default: true },
  ],
});
