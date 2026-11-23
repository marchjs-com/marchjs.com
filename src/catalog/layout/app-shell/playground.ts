import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { nav: boolean; top: boolean }

export default definePlayground<Values>({
  options: [
    { key: "nav", label: "Kenar çubuğu", default: true, toProp: (x) => (x ? el("div", "sc-shell-nav", el("strong", "", "HADİ"), el("span", "", "Panel"), el("span", "", "Projeler")) : false), toCode: { true: "{<NavMenu items={items} />}", false: null } },
    { key: "top", label: "Üst duyuru", default: true, toProp: (x) => (x ? el("div", "sc-shell-banner", "Yeni sürüm hazır: yenileyin.") : false), toCode: { true: "{<UpdateBanner />}", false: null } },
  ],
});
