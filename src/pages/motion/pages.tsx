// Motion › Page transition effects: ten variants (circle, wipe, stack, cube, flip, zoom-through, curtain, blinds,
// pixel dissolve, morph). Each variant is its own route (/motion/pages/<variant>) whose meta.transition names it, so a
// visit plays that variant; Back plays it in reverse; RTL mirrors the directional ones. All frames are engine animations.
import "../motion-pages.css";
import { effect, onCleanup } from "hadi-march";
import { Link, path, back } from "hadi-march/router";
import { motion } from "hadi-march/motion/engine/motion.ts";
import { usePageTransitions, PAGE_VARIANTS } from "hadi-march/motion/page-fx.ts";
import { definePageTransition } from "hadi-march/motion/page.ts";
import { Button } from "hadi-march/ui";
import { Section } from "../../demo.tsx";
import { MotionDemo, opt } from "../../playground.tsx";
import { pageFx } from "../../motion-route-meta.ts";

// every variant usable as meta.transition from now on
usePageTransitions(...PAGE_VARIANTS)

// a transition of your own: keyframes per side and direction (back plays the old page out on top)
let spin = 180, depth = 0.6
definePageTransition("spiral", (side, dir, rtl) => {
  const k = (dir === "back" ? -1 : 1) * (rtl ? -1 : 1)
  const away = { opacity: 0, transform: `rotate(${-k * spin}deg) scale(${depth})` }, here = { opacity: 1, transform: "none" }
  if (side === "in") return dir === "forward" ? [{ ...away, zIndex: 2 }, { ...here, zIndex: 2 }] : [{ opacity: 1 }, { opacity: 1 }]
  return dir === "back" ? [{ ...here, zIndex: 2 }, { ...away, zIndex: 2 }] : [here, { opacity: 0.4, transform: "scale(.96)" }]
})

const INFO: Record<string, { label: string; text: string; tone: string }> = {
  circle: { label: "Daire", text: "Yeni sayfa son basılan noktadan büyüyen bir daire içinde açılır; geri dönünce aynı noktaya kapanır.", tone: "o" },
  wipe: { label: "Silme", text: "Yeni sayfa satır sonundan başlayan düz bir silme ile gelir; sağdan sola yazımda aynalanır.", tone: "b" },
  stack: { label: "Yığın", text: "Yeni sayfa eskisinin üstüne kayar, eskisi geriye çekilip kararır; geri dönünce üstteki kayıp gider.", tone: "g" },
  cube: { label: "Küp", text: "İki sayfa bir küpün komşu yüzleri: kenar boyunca birlikte döner.", tone: "p" },
  flip: { label: "Çevir", text: "Sayfa bir kart gibi döner; yeni sayfa kartın arka yüzü.", tone: "o" },
  "zoom-through": { label: "İçinden geç", text: "Eski sayfa izleyiciye doğru büyüyüp kaybolur, yenisi uzaktan gelir.", tone: "b" },
  curtain: { label: "Perde", text: "Yeni sayfa ortadan iki yana açılan bir perde gibi belirir.", tone: "g" },
  blinds: { label: "Panjur", text: "Dikey şeritler aynı anda açılır.", tone: "p" },
  pixel: { label: "Piksel", text: "Yeni sayfa hücre hücre, karışık sırayla belirir.", tone: "o" },
  morph: { label: "Morph", text: "Yeni sayfa basılan bağlantının kutusundan sayfa boyutuna büyür.", tone: "b" },
  spiral: { label: "Sarmal", text: "Bu sayfanın kendi tanımladığı geçiş: definePageTransition ile dönerek büyür.", tone: "g" },
}
const NAMES = PAGE_VARIANTS.map((v) => v.name)

let rtlOn = false

export default function MotionPages() {
  document.title = "Sayfa geçişi efektleri · HADI March"
  const current = (): string => { const r = path().split("/")[3] ?? ""; return INFO[r] ? r : "circle" }
  const v = current(), info = INFO[v]!
  let $dur = pageFx.duration.peek()
  let $rtl = rtlOn
  let $spin = spin, $depth = Math.round(depth * 100)
  effect(() => { spin = $spin; depth = $depth / 100 })
  effect(() => { pageFx.duration.set($dur) })
  effect(() => { rtlOn = $rtl; document.documentElement.setAttribute("dir", $rtl ? "rtl" : "ltr") })
  onCleanup(() => { if (!path().startsWith("/motion/pages")) { rtlOn = false; document.documentElement.setAttribute("dir", "ltr") } })

  return <Section kicker="Hareket" title="Sayfa geçişi efektleri" lead="On geçiş, her biri ayrı dışa aktarım: yalnız kullandıklarını kaydet, sonra rota başına meta.transition ile seç. Geri gidince geçiş tersine oynar; yönlü olanlar sağdan sola yazımda aynalanır. View Transitions olan tarayıcıda sözde öğeler, ötekilerde sayfanın kendisi motorla canlanır.">
    <MotionDemo wide title="Rota başına geçiş" desc="Her kart kendi rotasına gider ve o rotanın geçişini oynatır. Bir karta bas, sonra Geri ile dön: aynı geçiş tersine oynar."
      call={() => `{ path: "/motion/pages/${v}", meta: { transition: { type: "${v}", duration: ${$dur} } } }`}
      code={`import { usePageTransitions, circle, cube, wipe } from "hadi-march/motion"

usePageTransitions(circle, cube, wipe)            // only what you use is bundled
createRouter({ routes: {
  "/photos/:id": { load: photo, meta: { transition: "circle" } },
  "/settings":   { load: settings, meta: { transition: { type: "cube", duration: 700 } } },
} })`}
      options={[
        opt("Süre", () => $dur, (x: number) => { $dur = x }, { min: 300, max: 1600, step: 20, unit: " ms" }),
        opt("Sağdan sola (RTL)", () => $rtl, (x: boolean) => { $rtl = x }),
      ]}>
      <div class={`sc-mo-scene sc-mo-t-${info.tone}`}>
        <span class="sc-mo-scene-ring" aria-hidden="true" /><span class="sc-mo-scene-ball" aria-hidden="true" />
        <span class="sc-mo-scene-kicker">{NAMES.includes(v) ? `${NAMES.indexOf(v) + 1} / ${NAMES.length}` : "definePageTransition"}</span>
        <strong class="sc-mo-scene-title">{info.label}</strong>
        <p>{info.text}</p>
        <Button size="sm" variant="secondary" on:click={() => back()}>Geri</Button>
      </div>
      <nav class="sc-mo-variants" aria-label="Geçişler">
        {NAMES.map((n) => <Link href={`/motion/pages/${n}`} class={`sc-mo-variant sc-mo-t-${INFO[n]!.tone}`} aria-current={n === v ? "page" : undefined}>{INFO[n]!.label}</Link>)}
      </nav>
    </MotionDemo>

    <MotionDemo title="Kendi geçişin" desc="definePageTransition ile yeni bir ad eklenir: her taraf (giden, gelen) ve yön (ileri, geri) için keyframe döndür. Bu sayfanın Sarmal geçişi böyle tanımlı; açıyı ve derinliği değiştirip dene."
      call={() => `definePageTransition("spiral", …rotate(${$spin}deg) scale(${($depth / 100).toFixed(2)})…)`}
      code={`import { definePageTransition } from "hadi-march/motion"

definePageTransition("spiral", (side, dir, rtl) => {
  const k = (dir === "back" ? -1 : 1) * (rtl ? -1 : 1)
  const away = { opacity: 0, transform: \`rotate(\${-k * 180}deg) scale(.6)\` }
  const here = { opacity: 1, transform: "none" }, still = [{ opacity: 1 }, { opacity: 1 }]
  if (side === "in") return dir === "forward" ? [away, here] : still      // forward: the new page spins in
  return dir === "back" ? [here, away] : still                           // back: the old one spins out
})
// route: meta: { transition: "spiral" }`}
      options={[
        opt("Dönüş", () => $spin, (x: number) => { $spin = x }, { min: 0, max: 360, step: 15, unit: "°" }),
        opt("Derinlik", () => $depth, (x: number) => { $depth = x }, { min: 20, max: 100, step: 5, unit: "%" }),
      ]}>
      <div class="sc-mo-custom">
        <span class="sc-mo-custom-dial" aria-hidden="true" style={{ transform: `rotate(${$spin}deg) scale(${$depth / 100})` }} />
        <Link href="/motion/pages/spiral" class="hm-btn hm-btn-primary">Sarmal ile git</Link>
      </div>
    </MotionDemo>

    <MotionDemo title="Tek motor" desc="Geçişin her karesi motorun bir animasyonu: global hız onu da yavaşlatır, Tümünü durdur açıkken sayfa anında değişir."
      call={() => `motion.config({ speed: ${motion.config().speed} })`}
      code={`motion.config({ speed: 0.25 })     // slow motion: every page transition too
motion.pauseAll()                   // swaps become instant`}
      options={[]}>
      <div class="sc-row">
        <Button variant="secondary" on:click={() => motion.config({ speed: motion.config().speed === 1 ? 0.25 : 1 })}>{() => motion.config().speed === 1 ? "Ağır çekim" : "Normal hız"}</Button>
        <Button variant={motion.paused() ? "primary" : "ghost"} on:click={() => motion.togglePause()}>{() => motion.paused() ? "Tümünü sürdür" : "Tümünü durdur"}</Button>
      </div>
    </MotionDemo>
  </Section>
}
