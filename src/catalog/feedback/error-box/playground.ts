import { definePlayground } from "../../spec.ts";

interface Values { title: string; message: string; retry: boolean; retryLabel: string }

export default definePlayground<Values>({
  options: [
    // empty: no title
    { key: "title", label: "Başlık (boşsa yok)", default: "Veriler alınamadı", kind: "text" },
    { key: "message", label: "Mesaj (message)", default: "Sunucuya ulaşılamadı (503). Bağlantınızı kontrol edin.", kind: "text" },
    // MarchIDE gives the raw component a bare retry (true): the button shows, a click does nothing
    { key: "retry", label: "Yeniden dene düğmesi", default: true },
    { key: "retryLabel", label: "Düğme metni", default: "default", kind: "segmented", options: [{ value: "default", label: "hazır metin" }, { value: "own", label: "Tekrar bağlan" }], visibleWhen: (v) => v.retry, toCode: { default: null, own: '"Tekrar bağlan"' } },
  ],
});
