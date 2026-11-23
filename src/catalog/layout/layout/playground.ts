import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { header: boolean; nav: boolean; aside: boolean; footer: boolean }

// MarchIDE: each region on is a box of its name; off is false (no region), so it also turns off one the code gives
const box = (name: string) => (on: unknown) => (on ? el("div", "sc-ld-box", name) : false);

export default definePlayground<Values>({
  options: [
    { key: "header", label: "Üst bilgi", default: true, toProp: box("Üst bilgi"), toCode: { true: "{<TopBar />}", false: null } },
    { key: "nav", label: "Gezinme", default: true, toProp: box("Gezinme"), toCode: { true: "{<SideNav />}", false: null } },
    { key: "aside", label: "Yan alan", default: false, toProp: box("Yan alan"), toCode: { true: "{<Toc />}", false: null } },
    { key: "footer", label: "Alt bilgi", default: true, toProp: box("Alt bilgi"), toCode: { true: "{<Footer />}", false: null } },
  ],
});
