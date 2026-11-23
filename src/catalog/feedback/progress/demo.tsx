// Showcase stage for Progress: label, value, look (bar / line), parts, colours, paint, tone and size from the Playground
// values (playground.ts). Timed parts fill one after the other and start over.
import { Progress } from "march/feedback";

export const code = `<Progress value={$p} label="Yükleniyor" showValue />
<Progress />                                              // belirsiz
<Progress value={$mb} max={480} label="Yükleniyor" showValue={(yuzde, mb) => mb + " / 480 MB"} />
<Progress value={60} paint="segments" colors="brand" />
<Progress paint="cycle" colors={["brand-blue", "brand-green"]} />
<Progress variant="line" value={$okunan} smooth={false} />          // ince çizgi: değeri dışarıdan sürülür
<Progress variant="line" fillRef={(dolgu) => scrollIndicator(dolgu)} />
<Progress segments={5} value={$adim} />                             // parçalı
<Progress segments={5} value={$i} duration={6000} paused={$dur} onDone={sonraki} />`

const COLORS: Record<string, "single" | "brand" | ("brand-blue" | "brand-green")[]> = { tone: "single", brand: "brand", pair: ["brand-blue", "brand-green"] }

export default function ProgressDemo(props: { values: { label: string; variant: string; parts: number; timed: boolean; indeterminate: boolean; value: number; colors: string; paint: string; tone: string; size: string; showValue: boolean; valueText: string } }) {
  let $part = 0
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const variant = v.variant as "bar", size = v.size as "md", tone = v.colors === "tone" ? (v.tone as "primary") : undefined, colors = COLORS[v.colors]
      if (v.parts > 0) {
        const n = v.parts
        if (v.timed) return [<Progress variant={variant} size={size} tone={tone} colors={colors} segments={n} value={() => $part % n} duration={1800} onDone={() => { $part++ }} ariaLabel="Hikâye" valueText={(i: number, m: number) => `${i + 1} / ${m}`} />,
          <span class="m-muted">{() => `Parça ${($part % n) + 1} / ${n} doluyor; dolunca sıradaki başlar.`}</span>]
        return <Progress variant={variant} size={size} tone={tone} colors={colors} segments={n} value={(v.value / 100) * n} label={v.label || "Adımlar"} />
      }
      const show = v.showValue && !v.indeterminate
      return <Progress variant={variant} value={v.indeterminate ? null : v.value} label={v.label || undefined}
        showValue={show && v.valueText === "own" ? (pct: number) => `${Math.round(pct * 4.8)} / 480 MB` : show}
        size={size} tone={tone} colors={colors} paint={v.colors === "tone" || v.variant !== "bar" ? undefined : (v.paint as "gradient")} />
    }}
  </div>
}
