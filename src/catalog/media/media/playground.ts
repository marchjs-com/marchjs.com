import { definePlayground } from "../../spec.ts";

interface Values { src: string; kind: string; alt: string; poster: string; size: string; controls: boolean; loop: boolean; muted: boolean; fallback: string }

export default definePlayground<Values>({
  options: [
    // src is required: MarchIDE's raw <Media /> gets this address (a public file of the showcase)
    { key: "src", label: "Adres (src)", default: "/media/dusk.jpg", options: [{ value: "/media/dusk.jpg", label: "resim" }, { value: "/media/hadi-waves.webm", label: "video" }, { value: "/media/missing.jpg", label: "bozuk adres" }] },
    { key: "kind", label: "Tür", default: "auto", kind: "segmented", options: [{ value: "auto", label: "uzantıdan" }, { value: "image", label: "resim" }, { value: "video", label: "video" }] },
    { key: "alt", label: "Alternatif metin (alt)", default: "Gün batımında tepeler", kind: "text" },
    { key: "poster", label: "Afiş (poster, video)", default: "/media/hadi-waves.jpg", kind: "text", visibleWhen: (v) => v.kind === "video" || /\.webm$/.test(v.src) },
    { key: "size", label: "Boyut", default: "md", kind: "segmented", options: [{ value: "sm", label: "küçük resim" }, { value: "md", label: "orta" }, { value: "full", label: "tam" }], toCode: { full: null } },
    { key: "controls", label: "Oynatıcı denetimleri", default: true, toCode: { false: "{false}" } },
    { key: "loop", label: "Döngü", default: false },
    { key: "muted", label: "Sessiz", default: false },
    { key: "fallback", label: "Yedek metin (fallback)", default: "Medya yüklenemedi", kind: "text" },
  ],
});
