import { definePlayground } from "../../spec.ts";

export default definePlayground<{ locale: string; disabled: boolean; icon: string }>({
  options: [
    { key: "locale", label: "Dil", default: "", options: [{ value: "", label: "uygulama" }, { value: "tr-TR", label: "tr-TR" }, { value: "en-US", label: "en-US" }, { value: "ja-JP", label: "ja-JP" }] },
    { key: "icon", label: "Takvim düğmesi", default: "calendar", options: [{ value: "calendar", label: "takvim ikonu" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }] },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
