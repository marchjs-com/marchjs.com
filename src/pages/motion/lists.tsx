// Motion › Lists: add / remove / reorder with FLIP (any renderer: the container is watched), exit ghosts, and
// staggered entrances (linear, from the centre, across a grid).
import "../motion-pages.css";
import { effect, onCleanup } from "hadi-march";
import { animateList, staggerIn, listFrames, type ListPreset } from "hadi-march/motion/list.ts";
import { animate } from "hadi-march/motion/engine/playback.ts";
import { Button } from "hadi-march/ui";
import { Icon, plus, refresh, x as xIcon } from "hadi-march/icons";
import { Section } from "../../demo.tsx";
// the demo kit is part of the shared Playground module (as on the other /motion/* pages)
import { MotionDemo, opt } from "../../playground.tsx";

const NAMES = ["Elma", "Armut", "Kiraz", "Erik", "Ayva", "İncir", "Nar", "Üzüm", "Dut", "Vişne", "Kayısı", "Şeftali"]
const PRESETS: { value: ListPreset; label: string }[] = [
  { value: "scale", label: "ölçek" }, { value: "rise", label: "yüksel" }, { value: "slide", label: "kay" },
  { value: "pop", label: "fırla" }, { value: "flip", label: "çevir" }, { value: "fade", label: "sol" },
]
interface Item { id: number; name: string; tone: number }

export default function MotionLists() {
  document.title = "Liste animasyonları · March"

  // 1 · FLIP list
  let $enter = "pop" as ListPreset, $exit = "scale" as ListPreset, $dur = 450
  let $items: Item[] = NAMES.slice(0, 6).map((name, i) => ({ id: i + 1, name, tone: (i % 4) }))
  let next = 7
  let listEl: HTMLElement | undefined
  let stop: (() => void) | null = null
  effect(() => {
    const o = { enter: $enter, exit: $exit, duration: $dur, stagger: 40 }
    queueMicrotask(() => { stop?.(); stop = listEl ? animateList(listEl, o) : null })
  })
  onCleanup(() => stop?.())
  const add = (): void => {
    const id = next++, at = Math.floor(Math.random() * ($items.length + 1))
    const copy = [...$items]; copy.splice(at, 0, { id, name: NAMES[id % NAMES.length]!, tone: id % 4 }); $items = copy
  }
  const addMany = (): void => { const n = [...$items]; for (let k = 0; k < 3; k++) { const id = next++; n.push({ id, name: NAMES[id % NAMES.length]!, tone: id % 4 }) } $items = n }
  const remove = (id: number): void => { $items = $items.filter((x) => x.id !== id) }
  const shuffle = (): void => { const a = [...$items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!] } $items = a }
  const sort = (): void => { $items = [...$items].sort((a, b) => a.name.localeCompare(b.name, "tr")) }

  // 2 · stagger
  let $sPreset = "rise" as ListPreset, $from = "center", $grid = true, $each = 45
  let gridEl: HTMLElement | undefined
  const play = (): void => { if (gridEl) staggerIn(gridEl.children, { preset: $sPreset, each: $each, from: $from as "center", ...($grid ? { grid: [4, 3] as [number, number] } : {}) }) }

  // 3 · presets
  let $side = "in", $rtl = false
  const presetEls = new Map<string, HTMLElement>()
  const playPreset = (p: ListPreset): void => { const el = presetEls.get(p); if (el) animate(el, listFrames(p, $side as "in", $rtl), { duration: 520, easing: p === "pop" ? "spring" : "expo", ...($side === "out" ? { direction: "alternate" as PlaybackDirection, iterations: 2 } : {}) }) }
  const timers: ReturnType<typeof setTimeout>[] = []
  onCleanup(() => timers.forEach(clearTimeout))
  const playAll = (): void => { PRESETS.forEach((p, i) => timers.push(setTimeout(() => playPreset(p.value), i * 90))) }

  return <Section kicker="Hareket" title="Liste animasyonları" lead="Ekle, kaldır, karıştır, sırala: öğeler yeni yerlerine kayar, giden öğe yerinde bir kopyayla çıkar, gelenler sırayla belirir. Kapsayıcı izlendiği için her çizim yöntemiyle çalışır; uçuştaki bir öğe yeniden yer değiştirirse ekranda olduğu yerden devam eder.">
    <MotionDemo wide title="Ekle, kaldır, sırala" desc="animateList(kapsayıcı) çocukları izler: eklenen gelir, silinen çıkar, yer değiştirenler FLIP ile kayar."
      call={() => `animateList(ul, { enter: "${$enter}", exit: "${$exit}", duration: ${$dur}, stagger: 40 })  // ${$items.length} öğe`}
      code={`import { animateList } from "hadi-march/motion"

const off = animateList(ul, { enter: "pop", exit: "scale", stagger: 40 })
// render the list any way you like: <For each={$items} key="id">…</For>`}
      options={[
        opt("Giriş", () => $enter, (v: ListPreset) => { $enter = v }, { options: PRESETS }),
        opt("Çıkış", () => $exit, (v: ListPreset) => { $exit = v }, { options: PRESETS }),
        opt("Süre", () => $dur, (v: number) => { $dur = v }, { min: 150, max: 1200, step: 25, unit: " ms" }),
      ]}>
      <div class="sc-mo-listwrap">
        <div class="sc-row">
          <Button size="sm" variant="primary" icon={plus} on:click={add}>Ekle</Button>
          <Button size="sm" variant="secondary" on:click={addMany}>3 ekle</Button>
          <Button size="sm" variant="secondary" icon={refresh} on:click={shuffle}>Karıştır</Button>
          <Button size="sm" variant="ghost" on:click={sort}>A → Z</Button>
        </div>
        <ul class="sc-mo-list" ref={(el: HTMLElement) => { listEl = el }}>
          <For each={$items} key="id">{(it: () => Item) =>
            <li class={`sc-mo-li sc-mo-t-${["o", "b", "g", "p"][it().tone]}`}>
              <strong>{it().name}</strong>
              <button type="button" class="sc-mo-li-x" aria-label={`${it().name} kaldır`} on:click={() => remove(it().id)}><Icon of={xIcon} /></button>
            </li>}
          </For>
        </ul>
      </div>
    </MotionDemo>

    <MotionDemo wide title="Sırayla giriş" desc="staggerIn bir öğe kümesini sırayla getirir: baştan, sondan, ortadan, kenarlardan ya da ızgarada uzaklığa göre."
      call={() => `staggerIn(grid.children, { preset: "${$sPreset}", each: ${$each}, from: "${$from}"${$grid ? ", grid: [4, 3]" : ""} })`}
      code={`import { staggerIn } from "hadi-march/motion"

staggerIn(".tile", { preset: "rise", each: 45, from: "center", grid: [4, 3] })`}
      options={[
        opt("Hareket", () => $sPreset, (v: ListPreset) => { $sPreset = v }, { options: PRESETS }),
        opt("Başlangıç", () => $from, (v: string) => { $from = v }, { options: [{ value: "start", label: "baş" }, { value: "center", label: "orta" }, { value: "end", label: "son" }, { value: "edges", label: "kenarlar" }] }),
        opt("Izgara uzaklığı", () => $grid, (v: boolean) => { $grid = v }),
        opt("Aralık", () => $each, (v: number) => { $each = v }, { min: 10, max: 150, step: 5, unit: " ms" }),
      ]} play={play}>
      <ul class="sc-mo-tiles" ref={(el: HTMLElement) => { gridEl = el }} aria-label="Kutular">
        {Array.from({ length: 12 }, (_, i) => <li class={`sc-mo-tile sc-mo-t-${["o", "b", "g", "p"][i % 4]}`}>{NAMES[i]}</li>)}
      </ul>
    </MotionDemo>

    <MotionDemo title="Hazır hareketler" desc="listFrames(ad, yön, rtl) giriş ve çıkış keyframe'lerini verir; animateList ve staggerIn de bunları kullanır. Bir karta bas ya da hepsini oynat. Kayma sağdan sola yazımda aynalanır."
      call={() => `listFrames(preset, "${$side}", ${$rtl})`}
      code={`import { listFrames, animate } from "hadi-march/motion"

animate(el, listFrames("pop", "in"), { easing: "spring" })
animate(el, listFrames("slide", "out", isRtl))`}
      options={[
        opt("Yön", () => $side, (v: string) => { $side = v }, { options: [{ value: "in", label: "giriş" }, { value: "out", label: "çıkış" }] }),
        opt("Sağdan sola", () => $rtl, (v: boolean) => { $rtl = v }),
      ]} play={playAll}>
      <ul class="sc-mo-presets">
        {PRESETS.map((p, i) => <li><button type="button" class={`sc-mo-preset sc-mo-t-${["o", "b", "g", "p"][i % 4]}`} ref={(el: HTMLElement) => { presetEls.set(p.value, el) }} on:click={() => playPreset(p.value)}>{p.label}</button></li>)}
      </ul>
    </MotionDemo>
  </Section>
}
