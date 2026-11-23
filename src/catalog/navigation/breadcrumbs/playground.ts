import { definePlayground } from "../../spec.ts";
import type { Crumb } from "march/navigation";
import { folder, fileText, hash, store, tag } from "march/icons";

interface Values { items: readonly Crumb[]; width: number; siblings: boolean; subs: boolean; separator: string; collapse: boolean }

// items is required (the crumbs): two paths to choose from (plain data, so the raw component in MarchIDE draws them;
// the stage makes each sibling choosable)
/** A file path down to a symbol (the stage's default); the file crumb opens its folder's other files. */
export const FILE_PATH: readonly Crumb[] = [
  { id: "hadi", label: "hadi", icon: folder },
  { id: "packages", label: "packages", icon: folder },
  { id: "web", label: "web-istemci", icon: folder },
  { id: "src", label: "src", icon: folder },
  { id: "file", label: "app.ts", icon: fileText, siblings: [
    { id: "app.ts", label: "app.ts", icon: fileText, sub: "Uygulamanın girişi" },
    { id: "router.ts", label: "router.ts", icon: fileText, sub: "Rota tablosu" },
    { id: "theme.css", label: "theme.css", icon: fileText, sub: "Tema tokenları" },
    { id: "store.ts", label: "store.ts", icon: fileText, sub: "Ortak durum" },
  ] },
  { id: "sym", label: "startApp()", icon: hash },
];
/** A shop's category path; the category crumb opens its neighbours. */
export const SHOP_PATH: readonly Crumb[] = [
  { id: "shop", label: "Mağaza", icon: store },
  { id: "women", label: "Kadın" },
  { id: "category", label: "Giyim", icon: tag, siblings: [
    { id: "clothes", label: "Giyim", sub: "1.240 ürün" },
    { id: "shoes", label: "Ayakkabı", sub: "530 ürün" },
    { id: "bags", label: "Çanta", sub: "212 ürün" },
  ] },
  { id: "dresses", label: "Elbiseler" },
  { id: "item", label: "Keten yazlık elbise" },
];

export default definePlayground<Values>({
  options: [
    { key: "items", label: "Yol (items)", default: FILE_PATH, options: [{ value: FILE_PATH, label: "dosya yolu" }, { value: SHOP_PATH, label: "mağaza" }] },
    { key: "width", label: "Genişlik", default: 360, min: 200, max: 760, step: 20, unit: "px" },
    { key: "siblings", label: "Kardeş menüleri", default: true },
    { key: "subs", label: "Kardeşlerde açıklama satırı", default: false, visibleWhen: (v) => v.siblings },
    { key: "separator", label: "Ayraç", default: "chevron", options: [{ value: "chevron", label: "ok" }, { value: "slash", label: "/" }, { value: "dot", label: "•" }, { value: "icon", label: "kendi ikonum" }, { value: "off", label: "yok" }],
      // what the prop gets (the raw component in MarchIDE): the chevron, a text, an icon, or none
      toCode: { chevron: null, slash: '"/"', dot: '"•"', icon: "{arrowRight}", off: "{false}" } },
    { key: "collapse", label: "Sığmayınca ortayı topla (…)", default: true },
  ],
});
