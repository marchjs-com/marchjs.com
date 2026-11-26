// Charts: one MarchIDE page per chart component (src/components/data/<name>/), and the meters and audio views (gauge,
// odometer, level meter; oscilloscope, spectrum, waveform, audio-reactive). The charts have their own entry
// (march/charts), so the card registry has no demo loader for them: each demo is a lazy part here (the chart code stays
// out of this route's chunk until its page opens); the option specs come from the registry.
import { lazy } from "march/lazy";
import { Hub } from "../hub.tsx";
import { TOPICS } from "../topics/charts.ts";
import { ComponentDemo } from "../component-demo.tsx";

const LineChartDemo = lazy(() => import("../catalog/data/line-chart/demo.tsx"), { placeholder: "card" });
const BarChartDemo = lazy(() => import("../catalog/data/bar-chart/demo.tsx"), { placeholder: "card" });
const PieChartDemo = lazy(() => import("../catalog/data/pie-chart/demo.tsx"), { placeholder: "card" });
const HeatmapDemo = lazy(() => import("../catalog/data/heatmap/demo.tsx"), { placeholder: "card" });
const StatDemo = lazy(() => import("../catalog/data/stat/demo.tsx"), { placeholder: "card" });
const SparklineDemo = lazy(() => import("../catalog/data/sparkline/demo.tsx"), { placeholder: "card" });
const ProgressRingDemo = lazy(() => import("../catalog/data/progress-ring/demo.tsx"), { placeholder: "card" });
const BarListDemo = lazy(() => import("../catalog/data/bar-list/demo.tsx"), { placeholder: "card" });
const GaugeDemo = lazy(() => import("../catalog/data/gauge/demo.tsx"), { placeholder: "card" });
const OdometerDemo = lazy(() => import("../catalog/data/odometer/demo.tsx"), { placeholder: "card" });
const LevelMeterDemo = lazy(() => import("../catalog/data/level-meter/demo.tsx"), { placeholder: "card" });
const OscilloscopeDemo = lazy(() => import("../catalog/media/oscilloscope/demo.tsx"), { placeholder: "card" });
const SpectrumDemo = lazy(() => import("../catalog/media/spectrum/demo.tsx"), { placeholder: "card" });
const WaveformDemo = lazy(() => import("../catalog/media/waveform/demo.tsx"), { placeholder: "card" });
const AudioReactiveDemo = lazy(() => import("../catalog/media/audio-reactive/demo.tsx"), { placeholder: "card" });
const AnalogClockDemo = lazy(() => import("../catalog/data/analog-clock/demo.tsx"), { placeholder: "card" });
const StopwatchDemo = lazy(() => import("../catalog/data/stopwatch/demo.tsx"), { placeholder: "card" });
const CompassDemo = lazy(() => import("../catalog/data/compass/demo.tsx"), { placeholder: "card" });
const AltimeterDemo = lazy(() => import("../catalog/data/altimeter/demo.tsx"), { placeholder: "card" });
const AttitudeIndicatorDemo = lazy(() => import("../catalog/data/attitude-indicator/demo.tsx"), { placeholder: "card" });
const ThermometerDemo = lazy(() => import("../catalog/data/thermometer/demo.tsx"), { placeholder: "card" });
const BatteryGaugeDemo = lazy(() => import("../catalog/data/battery-gauge/demo.tsx"), { placeholder: "card" });
const DotMatrixDemo = lazy(() => import("../catalog/data/dot-matrix/demo.tsx"), { placeholder: "card" });
const SplitFlapDemo = lazy(() => import("../catalog/data/split-flap/demo.tsx"), { placeholder: "card" });
const FlipClockDemo = lazy(() => import("../catalog/data/flip-clock/demo.tsx"), { placeholder: "card" });
const StereoVuDemo = lazy(() => import("../catalog/media/stereo-vu/demo.tsx"), { placeholder: "card" });
const LoudnessGraphDemo = lazy(() => import("../catalog/media/loudness-graph/demo.tsx"), { placeholder: "card" });

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
    "gauge": () => <ComponentDemo folder="data/gauge" view={GaugeDemo as never} title="Gauge: kadran" desc="Değer değişince ibre yaylı fizikle yerine oturur; bölgeler, kırmızı çizgi ve tepe işareti. VU görünümü canlı sesle oynar." />,
    "odometer": () => <ComponentDemo folder="data/odometer" view={OdometerDemo as never} title="Odometer: sayaç çarkları" desc="Yalnız değişen çarklar döner; kesir çarkı kırmızı, birim yanında. Mekanik, dijital ya da yaprak saat görünümü." />,
    "level-meter": () => <ComponentDemo folder="data/level-meter" view={LevelMeterDemo as never} title="LevelMeter: seviye ölçer" desc="▶ ile demo müziği başlat: LED'ler yanar, tepe ışığı düşer, kırpılma ışığı yanınca basıp söndür." />,
    "oscilloscope": () => <ComponentDemo folder="media/oscilloscope" view={OscilloscopeDemo as never} title="Oscilloscope: osiloskop" desc="Sesin dalga biçimi canlı: tetikleme dalgayı sabit tutar, fosfor izi iz bırakır; XY'de iki kanal Lissajous çizer." />,
    "spectrum": () => <ComponentDemo folder="media/spectrum" view={SpectrumDemo as never} title="Spectrum: spektrum" desc="Sesin frekansları log ölçekte: tepe başlıkları yavaşça düşer; çubuk, ayna, halka ya da çizgi." />,
    "waveform": () => <ComponentDemo folder="media/waveform" view={WaveformDemo as never} title="Waveform: ses dalgası" desc="Çalınan kısım renklenir; bas ya da sürükle, oklarla 5 saniye atla. Bölümler altta, canlı ses ya da süs olarak da çizer." />,
    "audio-reactive": () => <ComponentDemo folder="media/audio-reactive" view={AudioReactiveDemo as never} title="AudioReactive: sese tepki veren" desc="Sarmaladığı her şey sesle oynar: düzey ve bant CSS değişkenleri, hazır halka, nabız, ışıltı, zıplama." />,
    "analog-clock": () => <ComponentDemo folder="data/analog-clock" view={AnalogClockDemo as never} title="AnalogClock: analog saat" desc="Akrep, yelkovan ve saniye ibreli saat; saat dilimi ve kendi zaman kaynağı." />,
    "stopwatch": () => <ComponentDemo folder="data/stopwatch" view={StopwatchDemo as never} title="Stopwatch: kronometre" desc="Başlat, durdur, tur, sıfırla; alt kadran ve tur listesi." />,
    "compass": () => <ComponentDemo folder="data/compass" view={CompassDemo as never} title="Compass: pusula" desc="Dönen gül ya da ibre, yön harfleri, hedef rota." />,
    "altimeter": () => <ComponentDemo folder="data/altimeter" view={AltimeterDemo as never} title="Altimeter: altimetre" desc="Üç ibreli irtifa kadranı ve basınç penceresi." />,
    "attitude-indicator": () => <ComponentDemo folder="data/attitude-indicator" view={AttitudeIndicatorDemo as never} title="AttitudeIndicator: yapay ufuk" desc="Yunuslama ve yatış: gök, yer, merdiven, yatış ölçeği." />,
    "thermometer": () => <ComponentDemo folder="data/thermometer" view={ThermometerDemo as never} title="Thermometer: termometre" desc="Yaylı sıvı sütunu, °C / °F, renkli bölgeler." />,
    "battery-gauge": () => <ComponentDemo folder="data/battery-gauge" view={BatteryGaugeDemo as never} title="BatteryGauge: pil göstergesi" desc="Dolgu ya da hücreler, düşük / kritik, şarj." />,
    "dot-matrix": () => <ComponentDemo folder="data/dot-matrix" view={DotMatrixDemo as never} title="DotMatrix: LED nokta ekran" desc="5×7 noktalı LED tabela: metin ve sayılar, kayan yazı, silme / dağılma geçişi, kendi glifleriniz." />,
    "split-flap": () => <ComponentDemo folder="data/split-flap" view={SplitFlapDemo as never} title="SplitFlap: yaprak tabela" desc="Kalkış panosu gibi: her hücre harf makarasını kanat kanat çevirir; Türkçe büyük harf." />,
    "flip-clock": () => <ComponentDemo folder="data/flip-clock" view={FlipClockDemo as never} title="FlipClock: yaprak saat" desc="Saat, dakika, saniye kartları; yanıp sönen ayraç, 12 saatte ÖÖ/ÖS, saat dilimi ya da kendi zamanınız." />,
    "stereo-vu": () => <ComponentDemo folder="media/stereo-vu" view={StereoVuDemo as never} title="StereoVu: stereo VU" desc="Tek panelde sol / sağ ibreli VU ölçer, tepe ışıkları; metal, koyu ya da ahşap panel." />,
    "loudness-graph": () => <ComponentDemo folder="media/loudness-graph" view={LoudnessGraphDemo as never} title="LoudnessGraph: ses yüksekliği (LUFS)" desc="LUFS geçmişi −14 / −23 hedef çizgileriyle, stereo korelasyon grafiği ve canlı göstergeler." />,
  }
  return <Hub section="/charts" topics={TOPICS} kicker="Bileşenler" title="Grafikler" lead="SVG, erişilebilir (ekran okuyucu için veri tablosu, klavyeyle nokta gezme), tema paletiyle renklenir. Veri sinyalse grafik kendiliğinden güncellenir. Göstergeler ve ses görselleri bir sayıyla ya da canlı sesle (march/audio) çalışır." render={RENDER} params={props.params} />
}
