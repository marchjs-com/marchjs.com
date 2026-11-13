// Feedback: alerts, progress, skeleton, spinner, empty state, error box, loader, notice.
import { Progress, Skeleton, Spinner, Stack } from "hadi-march/ui";
import { onCleanup } from "hadi-march";
import { onFrame } from "hadi-march/motion";
import { ProgressRing } from "hadi-march/charts";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function Feedback(props: { params?: { rest?: string } }) {
  let $p = 35
  // the demo progress steps on the motion clock: global speed and "Stop all" reach it too
  let acc = 0
  onCleanup(onFrame((_t, dt) => { acc += dt; if (acc >= 900) { acc = 0; $p = $p >= 100 ? 0 : $p + 7 } }))
  const RENDER: Record<string, () => unknown> = {
    "alert": () => <ComponentDemo folder="feedback/alert" title="Alert: beş ton" desc="Başlık, ton ikonu ve kapatma düğmesi; uyarı ve tehlike hemen okunur (role=alert), ötekiler nazikçe (role=status)." />,
    "progress": () => <ComponentDemo folder="feedback/progress" title="Progress: değer, belirsiz, renkler" desc="Ton tek renk verir; birden çok renk gradient, eşit parçalar ya da akan döngü olarak dizilir. Dolgu kırpılır, RTL'de aynalanır." />,
    "indicators": () => <Demo wide title="Çok renkli göstergeler" desc="HADİ temasında ilerleme çubuğu, çark ve iskelet varsayılan olarak dört marka rengini taşır (öteki temalarda tek renk). colors ile renkler, paint ile dizilim seçilir: gradient, segments ya da cycle (renkler akar). Hareketi azalt tercihinde durağan."
    code={`<Progress value={60} />                                   // HADİ: four brand colors by default
<Progress value={60} paint="segments" />                  // equal colored parts
<Progress paint="cycle" />                                // indeterminate, colors flow
<Progress value={60} colors={["brand-blue", "brand-green"]} />
<Progress value={60} colors="single" />                   // one color
<ProgressRing value={72} colors="brand" />  <Spinner colors="brand" />`}>
    <div class="sc-multi">
      <Stack gap={3}>
        <Progress value={$p} label="Varsayılan (gradient)" showValue />
        <Progress value={$p} paint="segments" colors="brand" label="segments" showValue />
        <Progress paint="cycle" colors="brand" label="cycle (belirsiz)" />
        <Progress value={$p} colors={["brand-blue", "brand-green"]} label="İki renk" showValue />
        <Progress value={$p} colors="single" label="Tek renk" showValue />
      </Stack>
      <div class="sc-row">
        <ProgressRing value={$p} colors="brand" label="Gradient" />
        <ProgressRing value={$p} colors="brand" paint="segments" label="Segments" />
        <ProgressRing value={$p} colors="brand" paint="cycle" label="Cycle" />
        <Spinner size="lg" />
        <Spinner size="lg" colors="single" />
      </div>
      <Skeleton lines={3} />
    </div>
  </Demo>,
    "skeleton": () => <ComponentDemo folder="feedback/skeleton" title="Skeleton: içerik gelmeden düzen" desc="Satırlar, blok ya da ikisi birden; veri gelince aynı yere oturur, hiçbir şey zıplamaz. Parıltı marka renklerini taşıyabilir." />,
    "spinner": () => <ComponentDemo folder="feedback/spinner" title="Spinner: dönen halka" desc="Üç boyut; dört marka rengi, iki renk ya da tek renk. Ekran okuyucu etiketi okur." />,
    "empty": () => <ComponentDemo folder="feedback/empty" title="Empty: boş ekran ne yapılacağını söyler" desc="İkon, başlık, açıklama ve sonraki adım. Eylem düğmesine basınca başlık değişir." />,
    "error-box": () => <ComponentDemo folder="feedback/error-box" title="ErrorBox: hata ve yeniden dene" desc="Hatanın iletisi metin olarak; yeniden dene düğmesi denemeleri sayar, üçüncüsü başarılı olur." />,
    "loader": () => <ComponentDemo folder="feedback/loader" title="Loader: bir alanı dolduran yükleme" desc="Yerinde ya da içeriğin üstünde yarı saydam perdeyle; hızlı yüklemede çark hiç görünmez (gecikmeli belirir)." />,
  }
  return <Hub section="/feedback" kicker="Bileşenler" title="Durumlar" lead="Her ekranın yükleniyor, boş ve hata hâli birinci sınıf: iskeletler gerçek düzeni taklit eder, boş durumlar bir sonraki adımı gösterir." render={RENDER} params={props.params} />
}
