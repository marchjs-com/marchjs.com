import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { content: string; placement: string; motion: string; title: boolean; closable: boolean; width: string; outside: boolean; trigger: string; defaultOpen: boolean }

export default definePlayground<Values>({
  options: [
    // MarchIDE: the bare Popover's trigger (a button with this text), open at first so its options show
    { key: "trigger", label: "Tetikleyici", default: "Süzgeçler", kind: "text", toProp: (x) => el("button", "m-btn m-btn-secondary", String(x)), toCode: (x) => `{<Button>${String(x)}</Button>}` },
    { key: "defaultOpen", label: "Açık başlar", default: true },
    { key: "content", label: "İçerik", default: "form", options: [{ value: "form", label: "süzgeç formu" }, { value: "list", label: "seçenek listesi" }], prop: "children", toProp: (x) => (x === "list" ? el("ul", "", el("li", "", "En yeni"), el("li", "", "En eski"), el("li", "", "Ada göre")) : el("div", "", el("label", "", "☑ Yalnız açık etkinlikler"), el("br", ""), el("label", "", "☐ Ücretsiz"))), toCode: { form: "{<FilterForm />}", list: "{<SortList />}" } },
    { key: "placement", label: "Yer", default: "bottom-start", options: [{ value: "bottom-start", label: "alt · baş" }, { value: "bottom", label: "alt · orta" }, { value: "bottom-end", label: "alt · son" }, { value: "top-start", label: "üst · baş" }, { value: "top", label: "üst · orta" }, { value: "top-end", label: "üst · son" }] },
    { key: "motion", label: "Açılış hareketi", default: "scale", options: [{ value: "scale", label: "büyüyerek" }, { value: "fade", label: "belirerek" }, { value: "rise", label: "yükselerek" }, { value: "none", label: "yok" }] },
    { key: "title", label: "Başlık çubuğu", default: true, toProp: (x) => (x ? "Süzgeçler" : undefined), toCode: { true: '"Süzgeçler"', false: null } },
    { key: "closable", label: "Kapat düğmesi", default: true, visibleWhen: (v) => v.title },
    { key: "width", label: "Genişlik", default: "auto", options: [{ value: "auto", label: "içerik" }, "sm", "md", "lg"] },
    { key: "outside", label: "Dışarı tıklayınca kapan", default: true, prop: "closeOnOutside" },
  ],
});
