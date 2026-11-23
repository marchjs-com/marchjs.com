import { definePlayground } from "../../spec.ts";

interface Values { sample: boolean; start: string; trail: boolean; endings: boolean; transition: string; keys: boolean; choice: string; texts: boolean }

// a sample story for the raw component in MarchIDE (plain JSON: the passages object cannot come from a switch)
const SAMPLE = {
  intro: { title: "Cumartesi sabahı", color: "brand-orange", body: "Hafta sonu boş. HADİ'yi açtın; yakınında bir sürü şey oluyor. Ne yapmak istersin?",
    choices: [{ label: "Yakınımdaki etkinliklere bakayım", note: "Kadıköy · bugün 14 etkinlik", to: "explore" }, { label: "Kendi buluşmamı kurayım", note: "birkaç adımda", to: "host" }, { label: "Akşam için tanışma yemeğine yer ayırtayım", note: "6 kişilik masalar", to: "dinner" }] },
  explore: { title: "Yakınında bugün", color: "brand-blue", body: "Üç etkinlik gözüne çarpıyor: sahilde koşu, kafede masa oyunu gecesi ve gün batımında fotoğraf yürüyüşü.",
    choices: [{ label: "Sahil koşusu", note: "10:00 · 5 km · 12 kişi", to: "friends" }, { label: "Masa oyunu gecesi", note: "15:00 · yeni başlayanlar hoş geldi", to: "regular" }] },
  host: { title: "Kendi buluşman", color: "brand-orange", body: "Ne kuruyorsun? Yer ve saat belli; kontenjanı sen belirliyorsun.",
    choices: [{ label: "Kitap kulübü, 8 kişi", note: "ücretsiz", to: "regular" }, { label: "Seramik atölyesi, biletli", note: "bilet HADİ'den", to: "tickets" }] },
  dinner: { title: "Akşam 20:00", color: "brand-blue", body: "Altı kişilik masada herkesin ortak ilgisi seyahat. Tatlıya gelmeden bir sonraki rota konuşuluyor.",
    choices: [{ label: "Rota grubuna katıl", to: "friends" }, { label: "Anıları paylaş", to: "story" }] },
  friends: { title: "Yeni arkadaşlar", ending: "Sosyal kelebek", color: "brand-green", body: "Gün bitmeden arkadaş listen dört kişi büyüdü." },
  story: { title: "Anılar akışta", ending: "Hikâye anlatıcısı", color: "brand-purple", body: "Paylaştığın hikâye kırk sekiz beğeni aldı." },
  regular: { title: "Her hafta", ending: "Topluluk lideri", color: "brand-orange", body: "Etkinliğini tekrarlayan yaptın; üçüncü haftada yeni gelenler eskileri geçti." },
  tickets: { title: "Biletler tükendi", ending: "Girişimci", color: "brand-blue", body: "Atölyenin on iki bileti bir günde bitti." },
};

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets the sample story; off: no passages
    { key: "sample", label: "Örnek hikâye", default: true, prop: "passages", toCode: (x) => (x ? `{${JSON.stringify(SAMPLE)}}` : null) },
    { key: "start", label: "İlk pasaj (start)", default: "intro", options: [{ value: "intro", label: "sabah" }, { value: "explore", label: "etkinlikler" }, { value: "host", label: "kendi buluşman" }, { value: "dinner", label: "akşam yemeği" }] },
    { key: "trail", label: "Seçilen yol", default: true, toCode: { true: null, false: "{false}" } },
    { key: "endings", label: "Bulunan sonlar", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.trail },
    { key: "transition", label: "Sayfa geçişi", default: "turn", options: [{ value: "turn", label: "sayfa çevirme" }, { value: "slide", label: "kayma" }, { value: "fade", label: "solma" }, { value: "own", label: "kendi hareketim" }, { value: "none", label: "yok" }], toCode: { turn: null, own: "{(side) => ({ leave: { opacity: [1, 0] }, enter: { opacity: [0, 1], transform: [`translateY(${48 * side}px)`, \"none\"] } })}" } },
    { key: "keys", label: "Rakam tuşları (1–9)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "choice", prop: "renderChoice", label: "Seçenek içeriği", default: "default", options: [{ value: "default", label: "hazır" }, { value: "own", label: "kendi çizimim" }], toCode: { default: null, own: "{(choice) => <b>{choice.label}</b>}" } },
    { key: "texts", prop: "labels", label: "Kendi metinlerim", default: false, toCode: { false: null, true: "{{\"start\": \"Sabah\", \"restart\": \"Bir daha oyna\", \"path\": \"Yolun\"}}" } },
  ],
});
