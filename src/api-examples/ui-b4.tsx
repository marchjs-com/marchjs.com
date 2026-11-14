// API examples of hadi-march/ui, names "GradientEditor" … "IconButton" (code-point order; the neighbouring ranges: ui-b*.tsx).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`; components have Playground options.
import { signal } from "hadi-march";
import { Button, GradientEditor, Grid, HADI_RING, IconButton, Card } from "hadi-march/ui";
import { star, bell, trash, settings, users, zap, globe, shieldCheck, search } from "hadi-march/icons";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { useLog } from "./_ui-b.tsx";
import "./ui-b.css";
export { default as SIG } from "./ui-b4.sig.gen.ts";

export default examples({
  "hadi-march/ui": {
    GradientEditor: {
      code: `const bg = signal("linear-gradient(90deg, var(--m-brand-orange), var(--m-brand-purple))")
<GradientEditor value={bg} types={["linear", "radial"]} />
<div style={{ background: bg() }} />`,
      play: { options: [{ key: "presets", label: "Hazır geçişler", default: true }, { key: "output", label: "CSS çıktısı", default: false }] },
      run: (p: { values: { presets: boolean; output: boolean } }) => {
        const bg = signal("linear-gradient(90deg, var(--m-brand-orange), var(--m-brand-purple))")
        return <div class="sc-ex-stack">
          {() => { const pr = p.values.presets, o = p.values.output; return <GradientEditor value={bg} presets={pr ? undefined : false} output={o} aria-label="Kart arka planı" /> }}
          <div class="sc-ex-ui-b-swatch" style={() => ({ background: bg() })} role="img" aria-label="Sonuç" />
        </div>
      },
    },
    Grid: {
      code: `<Grid cols={3} gap={3} fill="stretch" equal>
  {plans.map((p) => <Card title={p.name}>{p.price}</Card>)}
</Grid>
<Grid min="14rem">…</Grid>        // as many 14rem columns as fit`,
      play: { options: [{ key: "cols", label: "Sütun", default: 3, options: [2, 3, 4] }, { key: "fill", label: "Son satır", default: "", options: [{ value: "", label: "hizalı" }, { value: "stretch", label: "paylaş" }, { value: "last", label: "son uzar" }] }] },
      run: (p: { values: { cols: number; fill: "" | "stretch" | "last" } }) => {
        const n = signal(5)
        return <div class="sc-ex-stack">
          <Row><Button size="sm" onClick={() => n.update((x) => Math.min(9, x + 1))}>Kart ekle</Button><Button size="sm" variant="ghost" onClick={() => n.update((x) => Math.max(1, x - 1))}>Kart çıkar</Button><Out label="Kart" value={n} /></Row>
          {() => { const c = p.values.cols, f = p.values.fill; return <Grid cols={c} gap={2} {...(f ? { fill: f } : {})} minCol="6rem">{Array.from({ length: n() }, (_, i) => <Card><strong>HADİ {i + 1}</strong></Card>)}</Grid> }}
        </div>
      },
    },
    HADI_RING: {
      code: `<BottomNav items={tabs} onCreate={compose} ring={HADI_RING} />     // the default ring
const ring = \`conic-gradient(\${HADI_RING.join(", ")}, \${HADI_RING[0]})\``,
      run: () => {
        const turn = signal(0)
        const ring = () => { const c = [...HADI_RING.slice(turn()), ...HADI_RING.slice(0, turn())]; return `conic-gradient(${c.join(", ")}, ${c[0]})` }
        return <Row>
          <span class="sc-ex-ui-b-ring" style={() => ({ background: ring() })} role="img" aria-label="HADİ halkası" />
          <div class="sc-ex-stack">{HADI_RING.map((c) => <Row><span class="sc-ex-ui-b-dot" style={{ background: c }} /><code>{c.replace(/,.*\)$/, ")")}</code></Row>)}</div>
          <Button size="sm" onClick={() => turn.update((n) => (n + 1) % HADI_RING.length)}>Döndür</Button>
        </Row>
      },
    },
    IconButton: {
      code: `<IconButton icon={trash} label="Sil" variant="danger" onClick={remove} />
<IconButton icon={star} label="Yıldızla" size="sm" aria-pressed={starred} />`,
      play: { options: [{ key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] }, { key: "variant", label: "Görünüm", default: "", options: [{ value: "", label: "varsayılan" }, { value: "ghost", label: "hayalet" }, { value: "primary", label: "birincil" }] }] },
      run: (p: { values: { size: "sm" | "md" | "lg"; variant: string } }) => {
        const starred = signal(false), log = useLog()
        return <div class="sc-ex-stack">
          {() => { const v = p.values.variant; return <Row>
            <IconButton icon={star} label={() => (starred() ? "Yıldızı kaldır" : "Yıldızla")} variant={v} size={() => p.values.size} aria-pressed={() => String(starred())} onClick={() => { starred.update((s) => !s); log.push(starred() ? "yıldızlandı" : "yıldız kalktı") }} />
            <IconButton icon={bell} label="Bildirimler" variant={v} size={() => p.values.size} onClick={() => log.push("bildirimler")} />
            <IconButton icon={trash} label="Sil" variant={v} size={() => p.values.size} onClick={() => log.push("silindi")} />
          </Row> }}
          <Log lines={log.lines} />
        </div>
      },
    },
  },
})
