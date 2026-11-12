// Layout: the Grid's last-row behaviours (default / fill="stretch" / fill="last" / balance) side by side; card count,
// columns and container width are adjustable. All CSS (flex-wrap + :has()), no JS measuring.
import { Grid, Segmented, Slider, Field, Card, Badge } from "hadi-march/ui";
import { Demo, Section } from "../demo.tsx";

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

export default function Layout() {
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
  return <Section kicker="Bileşenler" title="Yerleşim" lead="Grid hiçbir genişlikte yatay taşmaz. Son satır için isteğe bağlı fill (stretch: kalan alanı eşit paylaş, last: son kart genişlesin) ve balance (satırlara dengeli dağıt). Yalnız CSS; telefonda tek sütun.">
    <Demo wide title="Canlı karşılaştırma" desc="Kart sayısını, sütunu ve kapsayıcı genişliğini değiştir; seçili mod tam genişlikte, altında beşi yan yana."
      code={`<Grid cols={4} gap={3}>…</Grid>                 // default: aligned columns
<Grid cols={4} fill="stretch">…</Grid>           // the last row shares the space
<Grid cols={4} fill="last">…</Grid>              // son kart kalan alana uzar
<Grid cols={4} balance>…</Grid>                  // 5 cards → 3 + 2 (not 4 + 1)
<Grid min="17rem" fill="stretch">…</Grid>        // automatic columns + fill`}>
      <div class="sc-row sc-row-between">
        <Segmented bind:value={$mode} aria-label="Mod" options={MODES} />
        <Segmented bind:value={$cols} aria-label="Sütun" options={["2", "3", "4", "5", "6"].map((v) => ({ value: v, label: `${v} sütun` }))} />
      </div>
      <div class="sc-grid-controls">
        <Field label={() => `Kart sayısı: ${$count}`}><Slider bind:value={$count} min={1} max={16} /></Field>
        <Field label={() => `Kapsayıcı genişliği: %${$width}`}><Slider bind:value={$width} min={30} max={100} step={10} /></Field>
      </div>
      <div class={() => `sc-grid-frame sc-w-${$width}`}>{() => grid($mode)}</div>
    </Demo>
    <Demo wide title="Beş mod yan yana" desc="Aynı kart ve sütun sayısıyla; her kutu sabit bir sanal genişlikte (sütun başına 10rem) çizilip sığacak kadar küçültülür, böylece son satır farkı her ekranda görünür. Tek kart artınca stretch ile last aynı görünür; fark iki ve daha fazla artan kartta.">
      <div class="sc-grid-compare">
        {MODES.map((m) => <Card title={m.label}><div class="sc-grid-frame">
          <div class="sc-mini" ref={fitPreview} style={() => ({ width: `${Number($cols) * 10}rem` })}>{() => grid(m.value)}</div>
        </div></Card>)}
      </div>
    </Demo>
  </Section>
}
