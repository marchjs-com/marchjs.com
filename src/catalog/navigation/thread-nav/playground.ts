import { definePlayground } from "../../spec.ts";
import type { ThreadNavItem } from "march/components/navigation/thread-nav";

interface Values { items: readonly ThreadNavItem[]; magnify: boolean; bend: boolean; search: boolean; crumbs: boolean; closeOnNavigate: boolean; reach: number; grow: number; colors: boolean }

const P = (id: string, label: string, desc?: string): ThreadNavItem => ({ id, label, desc });
const C = (id: string, label: string, desc: string, pages: ThreadNavItem[]): ThreadNavItem => ({ id, label, desc, count: pages.length, children: pages });

// items is required (the sections): two trees to choose from, so the raw component in MarchIDE draws a real thread
/** The documentation's tree (the stage's default). */
export const DOCS: readonly ThreadNavItem[] = [
  { id: "start", label: "Başla", desc: "Kur, öğren, başvur.", color: "brand-orange", children: [
    C("first", "İlk adımlar", "Kurulum, ilk bileşen, CLI", [P("install", "Kurulum", "Depodan kur, ilk sayfa"), P("cli", "march CLI", "Geliştir, derle, denetle"), P("api", "API", "Her dışa aktarım")]),
    C("language", "Dil", "$ değişkenler, bind:, sx", [P("signals", "Sinyaller"), P("binding", "Bağlama"), P("sx", "sx stilleri")]),
  ] },
  { id: "components", label: "Bileşenler", desc: "Arayüzün yapı taşları.", color: "brand-blue", children: [
    C("buttons", "Düğmeler ve rozetler", "Button, menü, çip, avatar, ipucu", [P("button", "Düğme"), P("menu", "Menü"), P("chip", "Çip"), P("avatar", "Avatar")]),
    C("forms", "Formlar", "Alanlar, seçiciler, doğrulama", [P("field", "Alan"), P("select", "Seçim"), P("date", "Tarih"), P("wizard", "Sihirbaz")]),
    C("charts", "Grafikler", "Çizgi, alan, çubuk, pasta, ısı haritası", [P("stat", "Göstergeler", "Döneme göre değişim, eğilim çizgisi"), P("line", "Çizgi ve alan", "Sürükleyerek yakınlaştır"), P("bar", "Çubuk", "Gruplu ya da yatay"), P("pie", "Pasta ve halka", "Donut ortasında toplam"), P("heat", "Isı haritası", "Gün × saat yoğunluğu")]),
    C("feedback", "Durumlar", "Uyarı, ilerleme, iskelet, boş", [P("alert", "Uyarı"), P("progress", "İlerleme"), P("skeleton", "İskelet")]),
  ] },
  { id: "look", label: "Görünüm", desc: "Tema, ikon, yerleşim.", color: "brand-green", children: [
    C("themes", "Temalar", "Renk, yazı, yarıçap, gölge", [P("presets", "Hazır temalar"), P("editor", "Tema düzenleyici")]),
    C("icons", "İkonlar", "Yerleşik set ve paketler", [P("set", "İkon seti"), P("packs", "Paketler")]),
  ] },
  { id: "motion", label: "Hareket", desc: "Tek motor: animasyon, geçiş, efekt.", color: "brand-purple", children: [
    C("text", "Metin hareketi", "Giriş, döngü, daktilo", [P("enter", "Giriş"), P("loop", "Döngü")]),
    C("pages", "Sayfa geçişleri", "Küp, perde, panjur", [P("cube", "Küp"), P("curtain", "Perde")]),
  ] },
  { id: "built", label: "Yapılar", desc: "Parçalardan kurulmuş bütünler.", color: "brand-pink", children: [
    C("ide", "IDE", "Paneller, editör, konsol", [P("app-ui", "AppUI"), P("playground", "Playground")]),
  ] },
  { id: "infra", label: "Altyapı", desc: "Ekranın arkasındaki her şey.", color: "brand-gold", children: [
    C("managers", "Yöneticiler", "Depolama, geri al, bayraklar", [P("storage", "Depolama"), P("undo", "Geri al")]),
  ] },
];
/** A shop's admin panel: fewer sections, one without categories (it navigates itself). */
export const SHOP: readonly ThreadNavItem[] = [
  { id: "sales", label: "Satış", desc: "Siparişler ve iadeler.", color: "brand-orange", children: [
    C("orders", "Siparişler", "Bugün gelenler, kargoda olanlar", [P("new", "Yeni"), P("shipping", "Kargoda"), P("done", "Teslim edildi")]),
    C("returns", "İadeler", "Bekleyen ve onaylanan", [P("pending", "Bekleyen"), P("approved", "Onaylanan")]),
  ] },
  { id: "catalog", label: "Katalog", desc: "Ürünler ve stok.", color: "brand-blue", children: [
    C("products", "Ürünler", "Liste, fiyat, görsel", [P("all", "Tümü"), P("drafts", "Taslaklar")]),
    C("stock", "Stok", "Azalan ürünler", [P("low", "Azalan"), P("out", "Tükenen")]),
  ] },
  { id: "customers", label: "Müşteriler", desc: "Tek liste, kategorisiz.", color: "brand-green" },
];

export default definePlayground<Values>({
  options: [
    { key: "items", label: "Ağaç (items)", default: DOCS, options: [{ value: DOCS, label: "belgeler" }, { value: SHOP, label: "mağaza" }] },
    { key: "magnify", label: "Büyüteç (fisheye)", default: true },
    { key: "reach", label: "Büyüteç erimi (px)", default: 120, min: 60, max: 220, step: 10, visibleWhen: (v) => v.magnify },
    { key: "grow", label: "Büyüyünce açılan yer (px)", default: 22, min: 0, max: 40, step: 2, visibleWhen: (v) => v.magnify },
    { key: "bend", label: "İplik imlece eğilsin", default: true },
    { key: "search", label: "Kapsülde arama", default: true },
    { key: "crumbs", label: "Kapalıyken konum yolu", default: true },
    { key: "closeOnNavigate", label: "Seçince kapsül kapansın", default: true },
    // an option of the stage (it takes the colours off the tree), not a prop of the component
    { key: "colors", label: "Bölüm renkleri", default: true, prop: false },
  ],
});
