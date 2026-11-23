import { definePlayground } from "../../spec.ts";

// every option writes a real prop of DateTimeInput
export default definePlayground<{ defaultTime: string; timeLabel: string; disabled: boolean; readonly: boolean }>({
  options: [
    { key: "defaultTime", label: "Yalnız tarih seçilince saat", default: "09:00", kind: "text" },
    { key: "timeLabel", label: "Saat alanının adı", default: "Saat", kind: "text" },
    { key: "disabled", label: "Devre dışı", default: false },
    { key: "readonly", label: "Yalnız okunur", default: false },
  ],
});
