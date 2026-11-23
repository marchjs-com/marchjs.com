import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { target: string; color: string; delay: number; motion: string; text: string; placement: string }

export default definePlayground<Values>({
  options: [
    // text is required: the bare Tooltip in MarchIDE gets this default
    { key: "text", label: "Metin (text)", default: "Bağlantıyı kopyala", kind: "text" },
    { key: "placement", label: "Yer", default: "top", options: ["top", "bottom", "top-start", "bottom-end"] },
    { key: "target", label: "Neye ipucu", default: "button", options: [{ value: "button", label: "metinli düğme" }, { value: "icon", label: "ikon düğmesi" }], prop: "children", toProp: (x) => (x === "icon" ? el("button", "m-icon-btn", "🔔") : el("button", "m-btn m-btn-ghost", "Üstüme gel")), toCode: { button: "{<Button>Üstüme gel</Button>}", icon: "{<IconButton icon={bell} label=\"Bildirimler\" />}" } },
    { key: "color", label: "Balon rengi", default: "", options: [{ value: "", label: "ters yüzey" }, { value: "primary", label: "tema" }, { value: "success", label: "başarı" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }], toProp: (x) => (x || undefined) },
    { key: "delay", label: "Gecikme (üstüne gelince)", default: 300, kind: "segmented", options: [{ value: 0, label: "yok" }, { value: 300, label: "0,3 sn" }, { value: 1000, label: "1 sn" }] },
    { key: "motion", label: "Giriş hareketi", default: "scale", options: [{ value: "scale", label: "büyüyerek" }, { value: "fade", label: "belirerek" }, { value: "none", label: "yok" }] },
  ],
});
