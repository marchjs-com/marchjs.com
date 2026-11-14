// Page transitions: the router and the motion engine as one. Each tab is its own route with its own transition
// (meta.transition); back reverses it; RTL mirrors the slide; a tile moves from the grid to its page (shared element);
// the same record in a modal swaps with a transition. Global speed and "Stop all" reach every frame of it.
import "./transitions.css";
import { signal, effect, onCleanup } from "hadi-march";
import { Link, path, back } from "hadi-march/router";
import { motion } from "hadi-march/motion";
import { Button, Badge, Card, Slider, Field } from "hadi-march/ui";
import { Toggle } from "hadi-march/forms";
import { Demo, Section } from "../demo.tsx";
import { TILES } from "../transitions-demo/tiles.ts";
import TilePage from "../transitions-demo/tile.tsx";

// one route (/transitions/*), a transition per tab: meta.transition can be a function of the route params
export const meta = {
  transition: (p: { rest?: string }) => p.rest?.startsWith("tile/") ? { type: "fade", duration: 360 } : p.rest === "slide" ? "slide" : p.rest === "scale" ? { type: "scale", duration: 320 } : "fade",
}

const TABS = [
  { href: "/transitions", type: "fade", label: "Solma", text: "Eski sayfa solar, yenisi belirir. Rota tanımı: meta: { transition: \"fade\" }." },
  { href: "/transitions/slide", type: "slide", label: "Kayma", text: "Yeni sayfa satırın sonundan gelir; geri gidince ters yönden. Sağdan sola yazımda yön aynalanır." },
  { href: "/transitions/scale", type: "scale", label: "Ölçek", text: "Yeni sayfa hafifçe büyüyerek yerine oturur; geri gidince küçülerek." },
] as const;

// the RTL switch outlives the tab routes (each tab is a new page)
const rtl = signal(false);

export default function Transitions(props: { params: { rest?: string }; close?: () => void }) {
  document.title = "Sayfa geçişleri · March"
  const rest = props.params.rest ?? ""
  if (rest.startsWith("tile/")) return <TilePage id={rest.slice(5)} close={props.close} />
  const tab = () => TABS.find((t) => t.href === path()) ?? TABS[0]
  let $speed = motion.config().speed
  let $rtl = rtl.peek()
  effect(() => { motion.config({ speed: $speed }) })
  effect(() => { rtl.set($rtl); document.documentElement.setAttribute("dir", $rtl ? "rtl" : "ltr") })
  onCleanup(() => { if (!path().startsWith("/transitions")) { rtl.set(false); document.documentElement.setAttribute("dir", "ltr") } })
  return <Section kicker="Hareket" title="Sayfa geçişleri" lead="Yönlendirici ile hareket motoru tek parça: her rota kendi geçişini seçer, geri gidince animasyon tersine döner, sağdan sola yazımda kayma yönü aynalanır. Destekleyen tarayıcıda View Transitions, ötekilerde motorun kendisi; hareketi azalt tercihinde geçiş anında olur.">
    <Demo wide title="Rota başına geçiş" desc="Her sekme ayrı bir rota ve kendi geçişini taşır. Sekmeler arasında gez, sonra Geri ile dön: animasyon tersine oynar."
      code={`createRouter({ routes: {
  "/transitions": { load: list, meta: { transition: "fade" } },
  "/transitions/slide": { load: list, meta: { transition: "slide" } },
  "/transitions/scale": { load: list, meta: { transition: { type: "scale", duration: 320 } } },
} })
pageTransitions({ type: "fade" })   // default for routes without their own`}>
      <nav class="sc-row" aria-label="Geçiş türleri">
        {TABS.map((t) => <Button href={t.href} exact size="sm">{t.label}</Button>)}
        <Button size="sm" variant="ghost" on:click={() => back()}>Geri</Button>
        <Toggle bind:value={$rtl}>Sağdan sola (RTL)</Toggle>
      </nav>
      <Card class="sc-tr-card" title={tab().label}>
        <p>{tab().text}</p>
        <Badge tone="info">{`Geçiş: ${tab().type}`}</Badge>
      </Card>
    </Demo>
    <Demo wide title="Paylaşılan öğe" desc="Bir kareye bas: kare ızgaradaki yerinden kendi sayfasındaki yerine taşınır. Aynı data-hm-shared adı iki sayfada da olunca öğe aradaki yolu gider. Pencerede açınca ileri ve geri düğmeleri pencerenin içini geçişle değiştirir."
      code={`<Link href={\`/transitions/tile/\${id}\`}><div data-hm-shared={\`tile-\${id}\`} /></Link>
// the tile's page
<div data-hm-shared={\`tile-\${id}\`} class="big" />`}>
      <ul class="sc-tr-grid">
        {TILES.map((t) => <li>
          <Link href={`/transitions/tile/${t.id}`} class="sc-tr-link" aria-label={t.name}>
            <span class={`sc-tr-tile sc-tr-c${t.tone}`} data-hm-shared={`tile-${t.id}`}>{t.name}</span>
          </Link>
          <Button href={`/transitions/tile/${t.id}`} modal variant="ghost" size="sm">Pencerede aç</Button>
        </li>)}
      </ul>
    </Demo>
    <Demo title="Tek motor" desc="Geçişin her karesi motorun bir animasyonu: global hız onu da yavaşlatır, Tümünü durdur açıkken sayfa anında değişir.">
      <Field label={() => `Global hız: ${$speed.toFixed(2)}×`}><Slider bind:value={$speed} min={0.1} max={3} step={0.05} /></Field>
      <div class="sc-row">
        <Button variant={motion.paused() ? "primary" : "secondary"} on:click={() => motion.togglePause()}>{() => motion.paused() ? "Tümünü sürdür" : "Tümünü durdur"}</Button>
        <Button href="/animation" variant="ghost" size="sm">Animasyon motoru</Button>
      </div>
    </Demo>
  </Section>
}
