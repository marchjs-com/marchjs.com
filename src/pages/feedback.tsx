// Feedback: alerts, progress, skeleton, spinner, empty state, error box, loader, notice.
import { Hub } from "../hub.tsx";
import { TOPICS } from "../topics/feedback.ts";
import { ComponentDemo } from "../component-demo.tsx";

export default function Feedback(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "alert": () => <ComponentDemo folder="feedback/alert" title="Alert: beş ton" desc="Başlık, ton ikonu ve kapatma düğmesi; uyarı ve tehlike hemen okunur (role=alert), ötekiler nazikçe (role=status)." />,
    "progress": () => <ComponentDemo folder="feedback/progress" title="Progress: değer, belirsiz, renkler" desc="Ton tek renk verir; birden çok renk gradient, eşit parçalar ya da akan döngü olarak dizilir. Dolgu kırpılır, RTL'de aynalanır." />,
    "skeleton": () => <ComponentDemo folder="feedback/skeleton" title="Skeleton: içerik gelmeden düzen" desc="Satırlar, blok ya da ikisi birden; veri gelince aynı yere oturur, hiçbir şey zıplamaz. Parıltı marka renklerini taşıyabilir." />,
    "spinner": () => <ComponentDemo folder="feedback/spinner" title="Spinner: dönen halka" desc="Üç boyut; dört marka rengi, iki renk ya da tek renk. Ekran okuyucu etiketi okur." />,
    "empty": () => <ComponentDemo folder="feedback/empty" title="Empty: boş ekran ne yapılacağını söyler" desc="İkon, başlık, açıklama ve sonraki adım. Eylem düğmesine basınca başlık değişir." />,
    "status-dot": () => <ComponentDemo folder="feedback/status-dot" title="StatusDot: durum noktası" desc="Ton ya da tema rengi; halka ya da yanıp sönme ile nabız. Etiket verilirse ekran okuyucu okur, verilmezse süstür." />,
    "live-status": () => <ComponentDemo folder="feedback/live-status" title="LiveStatus: canlı durum satırı" desc="Az önce ne değiştiğini söyleyen satır (“3 satır seçildi”). Kibar canlı bölgedir: odak yerinden oynamadan ekran okuyucu okur. Görünür metin olabilir ya da yalnız okunur; yardım satırı verilirse önüne gelir." />,
    "check-mark": () => <ComponentDemo folder="feedback/check-mark" title="CheckMark: evet, hayır, kısmen" desc="Karşılaştırma tablosu ve özellik listeleri için ✓ ✕ – işareti; anlamı her zaman metin olarak da okunur." />,
    "error-box": () => <ComponentDemo folder="feedback/error-box"title="ErrorBox: hata ve yeniden dene" desc="Hatanın iletisi metin olarak; yeniden dene düğmesi denemeleri sayar, üçüncüsü başarılı olur." />,
    "loader": () => <ComponentDemo folder="feedback/loader" title="Loader: bir alanı dolduran yükleme" desc="Yerinde ya da içeriğin üstünde yarı saydam perdeyle; hızlı yüklemede çark hiç görünmez (gecikmeli belirir)." />,
  }
  return <Hub section="/feedback" topics={TOPICS} kicker="Bileşenler" title="Durumlar" lead="Her ekranın yükleniyor, boş ve hata hâli birinci sınıf: iskeletler gerçek düzeni taklit eder, boş durumlar bir sonraki adımı gösterir." render={RENDER} params={props.params} />
}
