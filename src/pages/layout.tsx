// Layout: the Grid's last-row behaviours (default / fill="stretch" / fill="last" / balance) side by side; card count,
// columns and container width are adjustable. All CSS (flex-wrap + :has()), no JS measuring.
import { Grid, Segmented, Slider, Field, Card, Badge } from "hadi-march/ui";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { Playground } from "../playground.tsx";
import { ComponentDemo } from "../component-demo.tsx";
import "./layout.css";

const MODES = [
  { value: "default", label: "Varsayılan" },
  { value: "stretch", label: "fill=stretch" },
  { value: "last", label: "fill=last" },
  { value: "balance", label: "balance" },
  { value: "balance-stretch", label: "balance + stretch" },
]

function Tile(props: { n: number }) {
  return <div class="sc-tile"><Badge tone="primary">{props.n}</Badge><span>Kart {props.n}</span></div>
}

// Draws the grid at its virtual width and zooms it down to the frame, so container and viewport queries see the
// virtual width (not the narrow card) and every mode keeps its own last row.
function fitPreview(mini: HTMLElement) {
  const fit = () => {
    const frame = mini.parentElement
    if (!frame) return
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    const cs = getComputedStyle(frame), room = frame.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    const zoom = String(Math.min(1, Math.floor(room / (parseFloat(mini.style.width) * rem) * 1000) / 1000))
    if (room > 0 && mini.style.getPropertyValue("zoom") !== zoom) mini.style.setProperty("zoom", zoom)
  }
  new MutationObserver(fit).observe(mini, { attributes: true, attributeFilter: ["style"] })
  queueMicrotask(() => { if (mini.parentElement) new ResizeObserver(fit).observe(mini.parentElement); fit() })
}

export default function Layout(props: { params?: { rest?: string } }) {
  // 7 cards in 5 columns: the only small setup where all five modes end differently (5+2, halves, one wide, 4+3, thirds)
  let $count = 7
  let $cols = "5"
  let $width = 100
  let $mode = "stretch"
  const grid = (mode: string) => {
    const cols = Number($cols), items = Array.from({ length: $count }, (_, i) => <Tile n={i + 1} />)
    if (mode === "default") return <Grid cols={cols} gap={3}>{items}</Grid>
    if (mode === "stretch") return <Grid cols={cols} gap={3} fill="stretch">{items}</Grid>
    if (mode === "last") return <Grid cols={cols} gap={3} fill="last">{items}</Grid>
    if (mode === "balance") return <Grid cols={cols} gap={3} balance>{items}</Grid>
    return <Grid cols={cols} gap={3} balance fill="stretch">{items}</Grid>
  }
  const RENDER: Record<string, () => unknown> = {
    "grid-live": () => <Demo wide title="Canlı karşılaştırma" desc="Kart sayısını, sütunu ve kapsayıcı genişliğini değiştir; seçili mod tam genişlikte, altında beşi yan yana."
    code={`<Grid cols={4} gap={3}>…</Grid>                 // default: aligned columns
<Grid cols={4} fill="stretch">…</Grid>           // the last row shares the space
<Grid cols={4} fill="last">…</Grid>              // son kart kalan alana uzar
<Grid cols={4} balance>…</Grid>                  // 5 cards → 3 + 2 (not 4 + 1)
<Grid min="17rem" fill="stretch">…</Grid>        // automatic columns + fill`}>
    <Playground options={[
      { label: "Mod", get: () => $mode, set: (v: string) => { $mode = v }, options: MODES },
      { label: "Sütun", get: () => $cols, set: (v: string) => { $cols = v }, options: ["2", "3", "4", "5", "6"] },
      { label: "Kart sayısı", get: () => $count, set: (v: number) => { $count = v }, min: 1, max: 16 },
      { label: "Kapsayıcı genişliği", get: () => $width, set: (v: number) => { $width = v }, min: 30, max: 100, step: 10, unit: "%" },
    ]}>
    <div class={() => `sc-grid-frame sc-w-${$width}`}>{() => grid($mode)}</div>
    </Playground>
  </Demo>,
    "grid-modes": () => <Demo wide title="Beş mod yan yana" desc="Aynı kart ve sütun sayısıyla; her kutu sabit bir sanal genişlikte (sütun başına 10rem) çizilip sığacak kadar küçültülür, böylece son satır farkı her ekranda görünür. Tek kart artınca stretch ile last aynı görünür; fark iki ve daha fazla artan kartta.">
    <div class="sc-grid-compare">
      {MODES.map((m) => <Card title={m.label}><div class="sc-grid-frame">
        <div class="sc-fit-preview" ref={fitPreview} style={() => ({ width: `${Number($cols) * 10}rem` })}>{() => grid(m.value)}</div>
      </div></Card>)}
    </div>
  </Demo>,
    "grid": () => <ComponentDemo folder="layout/grid" title="Grid: seçenekler" desc="Sütun sayısı, son satırın davranışı ve dengeleme. Dar ekranda sütunlar kendiliğinden azalır." />,
    "stack": () => <ComponentDemo folder="layout/stack" title="Stack, Toolbar ve Divider" desc="Satır ya da sütun, boşluk belirteçleri (0–8), hizalama ve satır kaydırma; etiketli araç çubuğu ve ayraçlar." />,
    "spacer": () => <ComponentDemo folder="layout/spacer" title="Spacer: esnek boşluk" desc="Kendinden sonrakileri satırın mantıksal sonuna iter; RTL'de aynalanır." />,
    "splitter": () => <ComponentDemo folder="layout/splitter" title="Splitter: boyutlandırılabilir bölmeler" desc="Tutamacı sürükleyin ya da odaklayıp ← → (RTL'de aynalı), Home / End; Enter başlangıç payına döndürür." />,
    "accordion": () => <ComponentDemo folder="layout/accordion" title="Accordion: açılır bölümler" desc="Varsayılan tek açık bölüm; birden çok açık seçeneği, yükseklik animasyonu, başlıklar arasında ↑ ↓ Home End." />,
    "disclosure": () => <ComponentDemo folder="layout/disclosure" title="Disclosure: katlanır bölüm" desc="Yerel details / summary üzerinde: klavye ve ekran okuyucu desteği hazır, açılıp kapanma animasyonlu." />,
    "layout": () => <ComponentDemo folder="layout/layout" title="Layout: değiştirilebilir sayfa çerçevesi" desc="Bölgeler (üst bilgi, gezinme, yan alan, alt bilgi, dört köşe), ada göre açılıp kapanan davranışlar (başa dön, okuma çubuğu, rota odağı, kaydırınca gizlenen üst bilgi) ve Layout.extend ile türetme. Bu vitrin de bir Layout: sağ alttaki düğme ve üstteki okuma çubuğu oradan gelir." />,
    "bottom-right-controls": () => <ComponentDemo folder="layout/bottom-right-controls" title="Sayfa köşeleri: BottomRightControls" desc="Sayfa çapı denetimler dört köşeden birine sırayla yerleşir, üst üste binmez; sağdan sola yazımda aynalanır." />,
    "overlay-scope": () => <ComponentDemo folder="layout/overlay-scope" title="OverlayScope: katmanların açılacağı kutu" desc="İçinde açılan çekmece, pencere, menü ve bildirim bu kutuda kalır; kipli pencere yalnız kutuyu kilitler. target: &quot;page&quot; ile sayfada açılır." />,
    "window": () => <ComponentDemo folder="layout/window" title="Window: taşınır, boyutlanır pencere" desc="Başlıktan sürükle; kenara bırakınca yarısına, üste bırakınca tamamına yerleşir; başlığa çift tıkla: alanı kapla. Kenar ve köşeden boyutla; küçült, kapla, kapat. HADİ, Mac ve Windows görünümü. Klavye: başlıkta oklar taşır, Shift ile boyutlar." />,
    "device-preview": () => <ComponentDemo folder="layout/device-preview" title="DevicePreview: gerçek cihaz önizlemesi" desc="Telefon ve tablet kasası, çentik, durum çubuğu, gerçek ekran boyu, döndürme; fare parmak gibi: sürükle-kaydır, fırlatma, uzun bas. Ekran bir OverlayScope: çekmece cihazın içinde açılır." />,
    "app-shell": () => <ComponentDemo folder="layout/app-shell" title="AppShell: uygulama çerçevesi" desc="Kenar çubuğu sütunu, üst duyuru ve kayan ana alan; önce gelen 'İçeriğe geç' bağlantısı. Dar ekranda tam genişlik." />,
  }
  return <Hub section="/layout" kicker="Yerleşim" title="Yerleşim" lead="Grid hiçbir genişlikte yatay taşmaz. Son satır için isteğe bağlı fill (stretch: kalan alanı eşit paylaş, last: son kart genişlesin) ve balance (satırlara dengeli dağıt). Yalnız CSS; telefonda tek sütun." render={RENDER} params={props.params} />
}
