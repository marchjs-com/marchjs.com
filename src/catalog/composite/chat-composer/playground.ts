import { definePlayground } from "../../spec.ts";

interface Values { voice: boolean; attach: boolean; emoji: boolean; reply: boolean; color: string; icons: boolean; motion: boolean }

export default definePlayground<Values>({
  options: [
    // MarchIDE: onVoice is a function (card only); the attach menu and the reply line are JSON; "Kendi ikonlarım"
    // picks the send button's icon
    { key: "voice", label: "Sesli mesaj", default: true, prop: false },
    { key: "attach", label: "Ek menüsü", default: true, prop: "attachments", toCode: (on) => (on ? '{[{"label":"Fotoğraf","icon":"🖼️"},{"label":"Dosya","icon":"📄"},{"label":"Konum","icon":"📍"}]}' : null) },
    { key: "emoji", label: "Emoji paneli", default: true },
    { key: "reply", label: "Yanıt önizlemesi", default: false, prop: "replyTo", toCode: (on) => (on ? '{{"name":"Kitap Kulübü","text":"Bu hafta rota nerede olacak?"}}' : null) },
    { key: "color", label: "Yuvarlak düğme rengi", default: "default", options: [{ value: "default", label: "turuncu / mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }, { value: "primary", label: "tema vurgusu" }], prop: "sendColor", toCode: { default: null, "brand-green": '"brand-green"', "brand-purple": '"brand-purple"', primary: '"primary"' } },
    { key: "icons", label: "Kendi ikonlarım", default: false, prop: "sendIcon", toCode: { true: "{arrowUp}", false: null } },
    { key: "motion", label: "Hareket", default: true },
  ],
});
