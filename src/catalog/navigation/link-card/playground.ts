import { definePlayground } from "../../spec.ts";

interface Values { title: string; href: string; icon: string; lead: string; color: string; description: string; meta: string; arrow: string }

export default definePlayground<Values>({
  options: [
    // href and title are required: MarchIDE's raw component gets these defaults (the first card of the stage shows them)
    { key: "title", label: "Başlık (title)", default: "Üyeler", kind: "text" },
    { key: "href", label: "Bağlantı (href)", default: "/data/link-card", kind: "text" },
    { key: "icon", label: "İkon", default: "users", options: [{ value: "users", label: "kişiler" }, { value: "calendar", label: "takvim" }, { value: "settings", label: "ayarlar" }, { value: "", label: "yok" }] },
    { key: "lead", label: "Baş", default: "", options: [{ value: "", label: "ikon karosu" }, { value: "own", label: "kendi düğümüm (avatar)" }], toCode: { own: "{<Avatar name=\"Üyeler\" decorative />}" } },
    { key: "color", label: "Karo rengi", default: "", options: [{ value: "", label: "tonlar" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }], visibleWhen: (v) => !v.lead && !!v.icon },
    { key: "description", label: "Açıklama", default: "Ara, davet et, rolleri yönet", kind: "text" },
    { key: "meta", label: "Sondaki metin", default: "128", kind: "text" },
    { key: "arrow", label: "Ok", default: "on", options: [{ value: "on", label: "var" }, { value: "own", label: "kendi işaretim" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{<Icon of={chevronRight} />}", off: "{false}" } },
  ],
});
