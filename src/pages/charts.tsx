// Charts: one MarchIDE page per chart component (src/components/data/<name>/). The charts have their own entry
// (march/charts), so the card registry has no demo loader for them: each demo is a lazy part here (the chart code stays
// out of this route's chunk until its page opens); the option specs come from the registry.
import { lazy } from "march/lazy";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

const LineChartDemo = lazy(() => import("march/components/data/line-chart/demo.tsx"), { placeholder: "card" });
const BarChartDemo = lazy(() => import("march/components/data/bar-chart/demo.tsx"), { placeholder: "card" });
const PieChartDemo = lazy(() => import("march/components/data/pie-chart/demo.tsx"), { placeholder: "card" });
const HeatmapDemo = lazy(() => import("march/components/data/heatmap/demo.tsx"), { placeholder: "card" });
const StatDemo = lazy(() => import("march/components/data/stat/demo.tsx"), { placeholder: "card" });
const SparklineDemo = lazy(() => import("march/components/data/sparkline/demo.tsx"), { placeholder: "card" });
const ProgressRingDemo = lazy(() => import("march/components/data/progress-ring/demo.tsx"), { placeholder: "card" });
const BarListDemo = lazy(() => import("march/components/data/bar-list/demo.tsx"), { placeholder: "card" });

export default function Charts(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "line-chart": () => <ComponentDemo folder="data/line-chart" view={LineChartDemo as never} title="LineChart ve AreaChart: çizgi ve alan" desc="Gün ekle: grafik akar. Çizimin üstünde sürükle: yakınlaşır (çift tık geri alır). Tab ile gel, ← → ile noktalar arasında gez, Enter seçer." />,
    "bar-chart": () => <ComponentDemo folder="data/bar-chart" view={BarChartDemo as never} title="BarChart: çubuk grafik" desc="Yeni hafta: çubuklar yeni boylarına kayar. Yığılmış ve yatay görünümü Seçenekler'den aç; açıklamadaki bir seriye tıklamak onu gizler." />,
    "pie-chart": () => <ComponentDemo folder="data/pie-chart" view={PieChartDemo as never} title="PieChart: pasta ve halka" desc="Sonraki ay: dilimler yeni açılarına döner. Ortadaki toplam ya da kendi yazın; dilime tıkla ya da klavyeyle gez." />,
    "heatmap": () => <ComponentDemo folder="data/heatmap" view={HeatmapDemo as never} title="Heatmap: ısı haritası" desc="Gün × saat ya da hafta takvimi. Yeni hafta: hücreler yeni tonlarına geçer; oklarla hücreden hücreye gez." />,
    "stat": () => <ComponentDemo folder="data/stat" view={StatDemo as never} title="Stat: gösterge" desc="Yeni gün: değerler, değişimler ve eğilim çizgileri akar. Bekleme bir maliyettir: azalması iyidir (invert)." />,
    "sparkline": () => <ComponentDemo folder="data/sparkline" view={SparklineDemo as never} title="Sparkline: eğilim çizgisi" desc="Canlı: her saniye yeni fiyat gelir, çizgiler kayar. Ekran okuyucu her çizginin özetini duyar." />,
    "progress-ring": () => <ComponentDemo folder="data/progress-ring" view={ProgressRingDemo as never} title="ProgressRing: ilerleme halkası" desc="Düşük, orta ve yüksek düzey kendi rengini alır; HADİ'nin dört rengi gradyan, parça ya da akan halka olur." />,
    "bar-list": () => <ComponentDemo folder="data/bar-list" view={BarListDemo as never} title="BarList: çubuk listesi" desc="Bir dinleme daha: sıra değişir, çubuklar uzar. Uzun bir şarkı adı sığmazsa kayarak görünür; satırlar düğme olur." />,
  }
  return <Hub section="/charts" kicker="Bileşenler" title="Grafikler" lead="SVG, erişilebilir (ekran okuyucu için veri tablosu, klavyeyle nokta gezme), tema paletiyle renklenir. Veri sinyalse grafik kendiliğinden güncellenir." render={RENDER} params={props.params} />
}
