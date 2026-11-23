import { definePlayground } from "../../spec.ts";

interface Values { kind: string; action: boolean; timeout: number; icon: string; closable: boolean; motion: string; position: string }

export default definePlayground<Values>({
  options: [
    // MarchIDE: the bare Toast is the stack (ToastHost); a toast's own options are toast()'s, shown in the examples
    { key: "position", label: "Yığının yeri (position)", default: "bottom-end", options: [{ value: "bottom-end", label: "alt son" }, { value: "bottom-start", label: "alt baş" }, { value: "bottom-center", label: "alt orta" }, { value: "top-end", label: "üst son" }, { value: "top-center", label: "üst orta" }] },
    { key: "kind", label: "Tür", default: "success", kind: "cards", options: [{ value: "info", label: "bilgi" }, { value: "success", label: "başarı" }, { value: "warn", label: "uyarı" }, { value: "danger", label: "tehlike" }], prop: false },
    { key: "action", label: "Geri al eylemi", default: true, prop: false },
    { key: "icon", label: "İkon", default: "kind", options: [{ value: "kind", label: "türün ikonu" }, { value: "own", label: "kendi ikonum (mor yıldız)" }, { value: "emoji", label: "emoji" }, { value: "off", label: "yok" }], prop: false },
    { key: "closable", label: "Kapat (×) düğmesi", default: true, prop: false },
    { key: "motion", label: "Giriş hareketi", default: "spring", options: [{ value: "spring", label: "yaylanarak" }, { value: "fade", label: "belirerek" }, { value: "none", label: "yok" }], prop: false },
    { key: "timeout", label: "Süre", default: 4000, kind: "segmented", options: [{ value: 2000, label: "2 sn" }, { value: 4000, label: "4 sn" }, { value: 8000, label: "8 sn" }, { value: 0, label: "kalıcı" }], prop: false },
  ],
});
