// Charts: one MarchIDE page per chart component (src/components/data/<name>/). Every chart is its own March entry, so
// the card registry has no demo loader for them: each demo is a lazy part here (the chart code stays out of this
// route's chunk until its page opens); the option specs come from the registry. The meters and audio views (gauge,
// odometer, level meter; oscilloscope, spectrum, waveform, audio-reactive) live on this page too.
import { lazy } from "march/lazy";
import { Hub } from "../hub.tsx";
import { TOPICS } from "../topics/charts.ts";
import { ComponentDemo } from "../component-demo.tsx";

const LineChartDemo = lazy(() => import("../catalog/data/line-chart/demo.tsx"), { placeholder: "card" });
const BarChartDemo = lazy(() => import("../catalog/data/bar-chart/demo.tsx"), { placeholder: "card" });
const PieChartDemo = lazy(() => import("../catalog/data/pie-chart/demo.tsx"), { placeholder: "card" });
const StreamGraphDemo = lazy(() => import("../catalog/data/stream-graph/demo.tsx"), { placeholder: "card" });
const ScatterChartDemo = lazy(() => import("../catalog/data/scatter-chart/demo.tsx"), { placeholder: "card" });
const HistogramDemo = lazy(() => import("../catalog/data/histogram/demo.tsx"), { placeholder: "card" });
const BoxPlotDemo = lazy(() => import("../catalog/data/box-plot/demo.tsx"), { placeholder: "card" });
const HeatmapDemo = lazy(() => import("../catalog/data/heatmap/demo.tsx"), { placeholder: "card" });
const FunnelChartDemo = lazy(() => import("../catalog/data/funnel-chart/demo.tsx"), { placeholder: "card" });
const WaterfallChartDemo = lazy(() => import("../catalog/data/waterfall-chart/demo.tsx"), { placeholder: "card" });
const BulletChartDemo = lazy(() => import("../catalog/data/bullet-chart/demo.tsx"), { placeholder: "card" });
const StatDemo = lazy(() => import("../catalog/data/stat/demo.tsx"), { placeholder: "card" });
const RadarChartDemo = lazy(() => import("../catalog/data/radar-chart/demo.tsx"), { placeholder: "card" });
const RadialBarChartDemo = lazy(() => import("../catalog/data/radial-bar-chart/demo.tsx"), { placeholder: "card" });
const ProgressRingDemo = lazy(() => import("../catalog/data/progress-ring/demo.tsx"), { placeholder: "card" });
const SunburstChartDemo = lazy(() => import("../catalog/data/sunburst-chart/demo.tsx"), { placeholder: "card" });
const TreemapDemo = lazy(() => import("../catalog/data/treemap/demo.tsx"), { placeholder: "card" });
const SankeyChartDemo = lazy(() => import("../catalog/data/sankey-chart/demo.tsx"), { placeholder: "card" });
const ChordChartDemo = lazy(() => import("../catalog/data/chord-chart/demo.tsx"), { placeholder: "card" });
const CandlestickChartDemo = lazy(() => import("../catalog/data/candlestick-chart/demo.tsx"), { placeholder: "card" });
const NetworkGraphDemo = lazy(() => import("../catalog/data/network-graph/demo.tsx"), { placeholder: "card" });
const ChoroplethMapDemo = lazy(() => import("../catalog/data/choropleth-map/demo.tsx"), { placeholder: "card" });
const SparklineDemo = lazy(() => import("../catalog/data/sparkline/demo.tsx"), { placeholder: "card" });
const BarListDemo = lazy(() => import("../catalog/data/bar-list/demo.tsx"), { placeholder: "card" });
const GaugeDemo = lazy(() => import("../catalog/data/gauge/demo.tsx"), { placeholder: "card" });
const OdometerDemo = lazy(() => import("../catalog/data/odometer/demo.tsx"), { placeholder: "card" });
const LevelMeterDemo = lazy(() => import("../catalog/data/level-meter/demo.tsx"), { placeholder: "card" });
const OscilloscopeDemo = lazy(() => import("../catalog/media/oscilloscope/demo.tsx"), { placeholder: "card" });
const SpectrumDemo = lazy(() => import("../catalog/media/spectrum/demo.tsx"), { placeholder: "card" });
const WaveformDemo = lazy(() => import("../catalog/media/waveform/demo.tsx"), { placeholder: "card" });
const AudioReactiveDemo = lazy(() => import("../catalog/media/audio-reactive/demo.tsx"), { placeholder: "card" });

export default function Charts(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "line-chart": () => <ComponentDemo folder="data/line-chart" view={LineChartDemo as never} title="LineChart, AreaChart ve ComboChart: çizgi, alan, karma" desc="Gün ekle: çizgi kayarak akar, eksen süzülür. Seçenekler'den eğri, işaret, ikinci eksen, hedef çizgisi, canlı pencere ve gezgini aç; çizimde sürükle yakınlaş, ← → ile noktalar." />,
    "bar-chart": () => <ComponentDemo folder="data/bar-chart" view={BarChartDemo as never} title="BarChart: çubuk grafik" desc="Yeni hafta: çubuklar tabandan büyür, yeni boylarına kayar, eksilen gün çöker. Değer etiketleri, hedef çizgisi, yığılmış ve yatay görünüm Seçenekler'de." />,
    "pie-chart": () => <ComponentDemo folder="data/pie-chart" view={PieChartDemo as never} title="PieChart: pasta ve halka" desc="Sonraki ay: dilimler yeni açılarına döner, eklenen dilim açılır, çıkan kapanır. Üstüne gelinen dilim dışarı çıkar; dilime tıkla ya da klavyeyle gez." />,
    "stream-graph": () => <ComponentDemo folder="data/stream-graph" view={StreamGraphDemo as never} title="StreamGraph: akış grafiği" desc="Sonraki ay: katmanlar şişer ve incelir; açıklamada bir türü gizle, diğerleri birbirine akar. Taban dalgalı, ortalı ya da %100." />,
    "scatter-chart": () => <ComponentDemo folder="data/scatter-chart" view={ScatterChartDemo as never} title="Gelir ve mutluluk" desc="Şehirler kabarcık olur; bölgeye göre renk ve simge, eğilim çizgisi ve çeyrek çizgileri. Sonraki yıl kabarcıkları kaydırır." />,
    "histogram": () => <ComponentDemo folder="data/histogram" view={HistogramDemo as never} title="Teslimat süreleri" desc="İki şehrin teslimat süreleri üst üste; yoğunluk eğrisi, ortanca ve hedef çizgisi. Kutu sayısını değiştir, çubuklar biçim değiştirsin." />,
    "box-plot": () => <ComponentDemo folder="data/box-plot" view={BoxPlotDemo as never} title="Acil serviste bekleme" desc="Gün gün bekleme süreleri: kutu, keman ya da ikisi, ham noktalar ve hedef çizgisi. Sonraki hafta kutuları yeniden biçimlendirir." />,
    "heatmap": () => <ComponentDemo folder="data/heatmap" view={HeatmapDemo as never} title="Heatmap: ısı haritası ve takvim" desc="Gün × saat ya da bir yılın takvimi: ay ve gün etiketleri, düzey açıklaması. Yeni veri: hücreler dalga gibi yeni tonlarına geçer; oklarla günden güne gez." />,
    "funnel-chart": () => <ComponentDemo folder="data/funnel-chart" view={FunnelChartDemo as never} title="FunnelChart: satın alma hunisi" desc="Sonraki hafta: aşamalar yeni genişliklerine akar; iade aşaması eklenince yukarıdan dökülür, çıkınca kapanır. Huni, çubuk ya da piramit." />,
    "waterfall-chart": () => <ComponentDemo folder="data/waterfall-chart" view={WaterfallChartDemo as never} title="WaterfallChart: kafenin ayı" desc="Geçen ayın kârından bu ayınkine: artılar ve eksiler sırayla kurulur, bağlantılar izler. Sonraki ay: çubuklar yeni yerlerine kayar." />,
    "bullet-chart": () => <ComponentDemo folder="data/bullet-chart" view={BulletChartDemo as never} title="BulletChart: çeyrek hedefleri" desc="Sonraki çeyrek: çubuklar dolar, hedef çizgileri kayar; destek satırı eklenip çıkar. Satıra tıkla, hangi aralıkta olduğunu söylesin." />,
    "stat": () => <ComponentDemo folder="data/stat" view={StatDemo as never} title="Stat: gösterge" desc="Yeni gün: değerler sayarak gelir, değişim okları döner, eğilim çizgileri akar. Bekleme bir maliyettir: azalması iyidir (invert)." />,
    "radar-chart": () => <ComponentDemo folder="data/radar-chart" view={RadarChartDemo as never} title="RadarChart: takımın yetenekleri" desc="Sonraki sezon: şekiller yeni değerlere dönüşür; açıklamada bir oyuncuyu gizle, şekli merkeze çekilsin. Bir eksene tıkla, değerleri söylesin." />,
    "radial-bar-chart": () => <ComponentDemo folder="data/radial-bar-chart" view={RadialBarChartDemo as never} title="RadialBarChart: günün hedefleri" desc="Sonraki gün: halkalar sırayla yeni değerlerine döner; ortada üstündeki halka yazar. Biçim: dörtte üç, tam daire ya da gösterge yayı." />,
    "progress-ring": () => <ComponentDemo folder="data/progress-ring" view={ProgressRingDemo as never} title="ProgressRing: ilerleme halkası" desc="Bir gece daha: halkalar yeni puana dolar, sayı birlikte sayar. Düşük, orta ve yüksek düzey kendi rengini alır; HADİ'nin dört rengi gradyan, parça ya da akan halka olur." />,
    "sunburst-chart": () => <ComponentDemo folder="data/sunburst-chart" view={SunburstChartDemo as never} title="SunburstChart: ayın harcamaları" desc="Bir yaya tıkla: içine yakınlaşır, ortası ya da Esc geri çıkar. Sonraki ay: yaylar yeni açılarına döner." />,
    "treemap": () => <ComponentDemo folder="data/treemap" view={TreemapDemo as never} title="Treemap: telefonun depolaması" desc="Sonraki ay: kutular yeni yerlerine kayar. Bir gruba tıkla, içine gir; kırıntılar ve Esc geri götürür. Renk: klasöre ya da aylık değişime göre." />,
    "sankey-chart": () => <ComponentDemo folder="data/sankey-chart" view={SankeyChartDemo as never} title="SankeyChart: gelir nereye gidiyor" desc="Sonraki ay: şeritler ve düğümler yeni değerlerine dönüşür. Bir düğümün üstüne gel, bütün akışı yansın." />,
    "chord-chart": () => <ComponentDemo folder="data/chord-chart" view={ChordChartDemo as never} title="ChordChart: şehirler arası göç" desc="Sonraki yıl: yaylar ve şeritler yeni açılarına döner. Bir şehrin üstüne gel, yalnız onun şeritleri kalsın." />,
    "candlestick-chart": () => <ComponentDemo folder="data/candlestick-chart" view={CandlestickChartDemo as never} title="Mum grafiği" desc="Canlı akışta yeni mum açılıştan büyür, pencere kayar; hacim, ortalamalar, hedef çizgisi ve gezgin." />,
    "network-graph": () => <ComponentDemo folder="data/network-graph" view={NetworkGraphDemo as never} title="Ağ grafiği" desc="Yeni kişi ortadan doğar, ağ yeniden oturur; düğümü sürükle, yakınlaş, komşuları vurgula." />,
    "choropleth-map": () => <ComponentDemo folder="data/choropleth-map" view={ChoroplethMapDemo as never} title="ChoroplethMap: Türkiye'nin illeri" desc="Sonraki veri: iller yeni renklerine geçer. Bölge çiplerine dokun, harita oraya kayar; bir ile tıkla, adını ve değerini söylesin." />,
    "sparkline": () => <ComponentDemo folder="data/sparkline" view={SparklineDemo as never} title="Sparkline: eğilim çizgisi" desc="Canlı: her saniye yeni fiyat gelir, çizgiler kayar. Çubuk ya da kazanç / kayıp biçimi Seçenekler'de; ekran okuyucu her çizginin özetini duyar." />,
    "bar-list": () => <ComponentDemo folder="data/bar-list" view={BarListDemo as never} title="BarList: çubuk listesi" desc="Bir dinleme daha: sıra değişir, satırlar yeni yerlerine kayar, çubuklar uzar. Uzun bir şarkı adı sığmazsa kayarak görünür; satırlar düğme olur." />,
    "gauge": () => <ComponentDemo folder="data/gauge" view={GaugeDemo as never} title="Gauge: kadran" desc="Değer değişince ibre yaylı fizikle yerine oturur; bölgeler, kırmızı çizgi ve tepe işareti. VU görünümü canlı sesle oynar." />,
    "odometer": () => <ComponentDemo folder="data/odometer" view={OdometerDemo as never} title="Odometer: sayaç çarkları" desc="Yalnız değişen çarklar döner; kesir çarkı kırmızı, birim yanında. Mekanik, dijital ya da yaprak saat görünümü." />,
    "level-meter": () => <ComponentDemo folder="data/level-meter" view={LevelMeterDemo as never} title="LevelMeter: seviye ölçer" desc="▶ ile demo müziği başlat: LED'ler yanar, tepe ışığı düşer, kırpılma ışığı yanınca basıp söndür." />,
    "oscilloscope": () => <ComponentDemo folder="media/oscilloscope" view={OscilloscopeDemo as never} title="Oscilloscope: osiloskop" desc="Sesin dalga biçimi canlı: tetikleme dalgayı sabit tutar, fosfor izi iz bırakır; XY'de iki kanal Lissajous çizer." />,
    "spectrum": () => <ComponentDemo folder="media/spectrum" view={SpectrumDemo as never} title="Spectrum: spektrum" desc="Sesin frekansları log ölçekte: tepe başlıkları yavaşça düşer; çubuk, ayna, halka ya da çizgi." />,
    "waveform": () => <ComponentDemo folder="media/waveform" view={WaveformDemo as never} title="Waveform: ses dalgası" desc="Çalınan kısım renklenir; bas ya da sürükle, oklarla 5 saniye atla. Bölümler altta, canlı ses ya da süs olarak da çizer." />,
    "audio-reactive": () => <ComponentDemo folder="media/audio-reactive" view={AudioReactiveDemo as never} title="AudioReactive: sese tepki veren" desc="Sarmaladığı her şey sesle oynar: düzey ve bant CSS değişkenleri, hazır halka, nabız, ışıltı, zıplama." />,
  }
  return <Hub section="/charts" topics={TOPICS} kicker="Bileşenler" title="Grafikler" lead="SVG, erişilebilir (ekran okuyucu için veri tablosu, klavyeyle gezme), tema paletiyle renklenir. Her grafik verisi değişince kendi animasyonuyla dönüşür: açılır, kayar, çöker; animate ile ayarla ya da kapat." render={RENDER} params={props.params} />
}
