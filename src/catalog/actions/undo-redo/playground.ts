import { definePlayground } from "../../spec.ts";

interface Values { canUndo: boolean; canRedo: boolean; actions: string; size: string; icons: string; steps: boolean; shortcuts: boolean; disabled: boolean }

export default definePlayground<Values>({
  options: [
    // without a history the buttons need canUndo / canRedo: MarchIDE's raw component gets true (both buttons work)
    { key: "canUndo", label: "Geri alınabilir (canUndo)", default: true },
    { key: "canRedo", label: "Yinelenebilir (canRedo)", default: true },
    // an array prop: MarchIDE's raw component leaves it out ("both" = the default order)
    { key: "actions", label: "Düğmeler", default: "both", options: [{ value: "both", label: "geri al + yinele" }, { value: "undo", label: "yalnız geri al" }], toCode: { both: null, undo: "{[\"undo\"]}" } },
    { key: "size", label: "Boyut", default: "md", options: ["xs", "sm", "md", "lg"] },
    { key: "icons", label: "İkonlar", default: "default", options: [{ value: "default", label: "varsayılan" }, { value: "own", label: "kendi ikonlarım" }], prop: false },
    // default true: false is written as {false} (left out, the component would keep its default)
    // on: the raw component (no history) gets two step names of its own, so the tooltip shows what is undone
    { key: "steps", label: "İpucunda adım adı", default: true, toCode: { true: '{{ undo: "Yazma", redo: "Silme" }}', false: "{false}" } },
    { key: "shortcuts", label: "İpucunda kısayol", default: true, toCode: { true: null, false: "{false}" } },
    { key: "disabled", label: "Kapalı", default: false },
  ],
});
