import { definePlayground } from "../../spec.ts";

interface Values { open: boolean; direction: string; size: string; motion: string; icon: string; color: string }

export default definePlayground<Values>({
  options: [
    { key: "open", label: "Açık", default: false },
    { key: "direction", label: "Kapalıyken yön", default: "end", options: [{ value: "end", label: "satır sonu" }, { value: "start", label: "satır başı" }, { value: "down", label: "aşağı" }, { value: "up", label: "yukarı" }] },
    { key: "size", label: "Boyut", default: "md", options: ["xs", "sm", "md", "lg"] },
    // "off" is written as motion={false} (the component's value), so MarchIDE's raw component gets false too
    { key: "motion", label: "Dönüş", default: "smooth", options: [{ value: "smooth", label: "yumuşak" }, { value: "spring", label: "yaylı" }, { value: "off", label: "yok" }], toCode: { smooth: null, off: "{false}" } },
    // icon values are what the icon prop takes (an icon's name, or a text mark): "" = the built-in arrow
    { key: "icon", label: "İkon", default: "", options: [{ value: "", label: "hazır ok" }, { value: "arrowRight", label: "kendi ikonum" }, { value: "›", label: "metin (›)" }] },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "metin rengi" }, { value: "primary", label: "vurgu" }, { value: "brand-orange", label: "turuncu" }, { value: "danger", label: "tehlike" }], prop: "m:color" },
  ],
});
