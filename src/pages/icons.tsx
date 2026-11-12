// Icons: the March set, open-source icon packs (hadi-march/icons/<pack>), icons by name, stroke / fill / RTL.
// The March gallery reads the catalog (one separate module); pack galleries fetch JSON (dist/icon-packs) only when a
// pack is opened, so no icon data rides along with this page or the start-up.
import { ICONS } from "hadi-march/icons/catalog";
import { Icon, type IconDef } from "hadi-march/icons";
import { registerIconPack, icon, Icon as NamedIcon } from "hadi-march/icons/packs";
import { arrowLeft as lucideArrow, undo2 } from "hadi-march/icons/lucide";
import { arrowLeft as tablerArrow } from "hadi-march/icons/tabler";
import { arrowLeft as heroArrow } from "hadi-march/icons/heroicons";
import { arrowLeft as phosphorArrow } from "hadi-march/icons/phosphor";
import { arrowBack } from "hadi-march/icons/material-symbols";
import { arrowLeftLine } from "hadi-march/icons/remix";
import { arrowLeft as bootstrapArrow } from "hadi-march/icons/bootstrap";
import { arrowLeft as featherArrow } from "hadi-march/icons/feather";
import { SearchBox, toast, Segmented, RadioGroup, TextInput } from "hadi-march/ui";
import { onCleanup, effect } from "hadi-march";
// the window of core/virtual.ts (windowRange), inlined: importing that module from this page changes which pages share
// it, and the build's chunk packer then regroups unrelated pages under the 10 KB floor
const windowRange = ({ count, scrollTop = 0, height, rowHeight, overscan = 6 }: { count: number; scrollTop?: number; height: number; rowHeight: number; overscan?: number }) => { const first = Math.min(count, Math.floor(Math.max(0, scrollTop) / rowHeight)); const start = Math.max(0, first - overscan); const end = Math.min(count, first + Math.ceil(height / rowHeight) + 1 + overscan); return { start, end } };
import { Demo, Section } from "../demo.tsx";
import { loadIndex, loadNames, loadPack, toDef, importLine, type PackInfo, type PackData } from "../icon-packs.ts";

const ALL = Object.entries(ICONS) as [string, IconDef][];
type Size = "md" | "lg" | "xl";
const SIZES = [{ value: "md", label: "16" }, { value: "lg", label: "20" }, { value: "xl", label: "24" }];

function copy(text: string, what: string): void {
  void navigator.clipboard?.writeText(text);
  toast(`${what} kopyalandı`, { kind: "success" });
}

// the showcase's packs answer <Icon name="pack:…"> from the same gallery data (an app registers hadi-march/icons/<pack>/pack)
let registered = false;
function registerGalleryPacks(list: PackInfo[]): void {
  if (registered) return;
  registered = true;
  for (const p of list) if (p.id !== "march") registerIconPack({
    id: p.id, name: p.name, license: p.license, viewBox: p.vb, mode: p.mode, count: p.count,
    resolve: (n) => loadPack(p.id).then((d) => { const r = d.icons.find((x) => x[0] === n); return r ? toDef(d, r[0], r[2], r[3], r[4]) : undefined }),
  });
}

/**
 * Virtual icon grid: only the rows in view (+ overscan) exist; the rest is the scroll height. Columns follow the width.
 * cell(i) draws item i; the grid asks again when count changes.
 */
function IconGrid(props: { count: () => number; cell: (i: number) => unknown; label: string; empty: string }) {
  const ROW = 92, MIN = 104;
  let $top = 0
  let $height = 420
  let $cols = 6
  let ro: ResizeObserver | null = null
  onCleanup(() => ro?.disconnect())
  const rows = () => Math.ceil(props.count() / $cols)
  const win = () => windowRange({ count: rows(), scrollTop: $top, height: $height, rowHeight: ROW, overscan: 3 })
  const fit = (el: HTMLElement) => { $cols = Math.max(2, Math.floor(el.clientWidth / MIN)); $height = el.clientHeight || 420 }
  return <div class="sc-igrid" role="list" aria-label={props.label} tabindex="0"
    ref={(el: HTMLElement) => { queueMicrotask(() => fit(el)); if (typeof ResizeObserver === "function") { ro = new ResizeObserver(() => fit(el)); ro.observe(el) } }}
    on:scroll={(e: Event) => { $top = (e.currentTarget as HTMLElement).scrollTop }}>
    {() => props.count() === 0 ? <p class="sc-igrid-empty">{props.empty}</p> : null}
    <div class="sc-igrid-space" style={() => ({ "block-size": `${rows() * ROW}px` })}>
      {() => {
        const w = win(), cols = $cols, out: unknown[] = []
        for (let r = w.start; r < w.end; r++) {
          const cells: unknown[] = []
          for (let c = 0; c < cols; c++) { const i = r * cols + c; if (i < props.count()) cells.push(props.cell(i)) }
          out.push(<div class="sc-igrid-row" role="presentation" style={{ "inset-block-start": `${r * ROW}px`, "grid-template-columns": `repeat(${cols}, minmax(0, 1fr))` }}>{cells}</div>)
        }
        return out
      }}
    </div>
  </div>
}

function MarchSet() {
  let $q = ""
  let $size = "lg"
  const list = () => ALL.filter(([name, d]) => !$q || name.toLowerCase().includes($q.toLowerCase()) || d.name.includes($q.toLowerCase()))
  return <Demo wide title="İkon seti" desc="Ara, boyut seç, ikona tıkla: içe aktarma satırı seçili boyutla kopyalanır."
    code={`import { Icon, users, search } from "hadi-march/icons"

<Icon of={users} size="lg" />
<Button icon={search}>Ara</Button>   // every icon prop takes an icon`}>
    <div class="sc-row sc-row-between sc-options">
      <SearchBox bind:value={$q} placeholder="İkon ara (ör. user, chart)" shortcut />
      <Segmented bind:value={$size} aria-label="Boyut" options={SIZES} />
    </div>
    <div class="sc-icons">
      <For each={list()} key={([n]: [string, IconDef]) => n}>{(e: () => [string, IconDef]) =>
        <button type="button" class="sc-icon" title={e()[0]} on:click={() => copy(importLine("march", e()[0], $size), `${e()[0]} (size="${$size}")`)}>
          <Icon of={e()[1]} size={$size as Size} />
          <span>{e()[0]}</span>
        </button>}
      </For>
    </div>
  </Demo>
}

function PackGallery() {
  let $packs: PackInfo[] = []
  let $pack = "lucide"
  let $q = ""
  let $size = "lg"
  let $data: Record<string, PackData> = {}
  let $names: Record<string, string[]> | null = null
  let $failed = false
  void loadIndex().then((l) => { $packs = l; registerGalleryPacks(l) }, () => { $failed = true })
  const want = (id: string) => { if (!$data[id]) void loadPack(id).then((d) => { $data = { ...$data, [id]: d } }, () => { $failed = true }) }
  // search runs over every pack's names (one small file); a pack's drawings load when one of its icons is in view
  const searching = () => $q.trim().length > 0 || $pack === "all"
  const needNames = () => { if (searching() && !$names) void loadNames().then((n) => { $names = Object.fromEntries(Object.entries(n).map(([k, v]) => [k, v.split(" ")])) }) }
  const hits = (): [string, number][] => {
    needNames()
    const q = $q.trim().toLowerCase()
    if (!searching()) { want($pack); return Array.from({ length: $packs.find((p) => p.id === $pack)?.count ?? 0 }, (_, i) => [$pack, i]) }
    const names = $names
    if (!names) return []
    const out: [string, number][] = []
    for (const [id, list] of Object.entries(names)) {
      if ($pack !== "all" && id !== $pack) continue
      list.forEach((n, i) => { if (!q || n.includes(q)) out.push([id, i]) })
    }
    return out
  }
  let $list: [string, number][] = []
  effect(() => { $list = hits() })
  const info = () => $packs.find((p) => p.id === $pack)
  const sample = (p: PackInfo) => <span class="sc-pack-prev">{p.samples.map((s) => <Icon of={toDef(p, s[0], s[1], s[2], s[3])} size="lg" />)}</span>
  const total = () => $packs.reduce((s, x) => s + x.count, 0).toLocaleString("tr-TR")
  // a visual picker: each pack as a card with three of its icons, its icon count and license
  const options = () => [
    { value: "all", label: "Tümü", hint: `${total()} ikon`, icon: <span class="sc-pack-prev">{$packs.slice(1, 4).map((p) => p.samples[0] ? <Icon of={toDef(p, ...p.samples[0])} size="lg" /> : null)}</span> },
    ...$packs.map((p) => ({ value: p.id, label: p.name, hint: `${p.count.toLocaleString("tr-TR")} ikon · ${p.license}`, icon: sample(p) })),
  ]
  const cell = (i: number) => {
    const [id, n] = $list[i]!
    const d = $data[id]
    if (!d) { want(id); return <span class="sc-igrid-cell is-loading" role="listitem" aria-hidden="true" /> }
    const r = d.icons[n]
    if (!r) return null
    return <button type="button" class="sc-igrid-cell" role="listitem" title={`${id}:${r[0]}`}
      on:click={() => copy(importLine(id, r[1], $size), `${r[1]} (${id}, size="${$size}")`)}>
      <Icon of={toDef(d, r[0], r[2], r[3], r[4])} size={$size as Size} />
      <span>{r[0]}</span>
      {$pack === "all" ? <small>{id}</small> : null}
    </button>
  }
  return <Demo wide title="İkon paketleri" desc="Açık kaynak ikon setleri: paket seç, tüm paketlerde ara, ikona tıkla; doğru içe aktarma satırı kopyalanır. Izgara sanal: binlerce ikonun yalnız görünenleri çizilir."
    code={`// one icon, one export: only what you import is bundled
import { Icon } from "hadi-march/icons"
import { rocket } from "hadi-march/icons/lucide"
import { chartBar } from "hadi-march/icons/tabler"

<Icon of={rocket} size="lg" />
<Button icon={chartBar}>Rapor</Button>

// add another set (downloaded from its official package, license included)
// march icons add phosphor remix`}>
    <div class="sc-options sc-pack-pick">
      {() => $packs.length
        ? <RadioGroup variant="card" inline bind:value={$pack} aria-label="Paket" options={options()} />
        : <p class="sc-igrid-empty">{$failed ? "Paket listesi yüklenemedi." : "Paketler yükleniyor…"}</p>}
    </div>
    <div class="sc-row sc-row-between sc-options">
      <SearchBox bind:value={$q} placeholder={$pack === "all" ? "Tüm paketlerde ara (ör. arrow)" : "Pakette ara"} />
      <Segmented bind:value={$size} aria-label="Boyut" options={SIZES} />
    </div>
    <div class="sc-pack-info" aria-live="polite">
      {() => {
        const p = info()
        if ($pack === "all" || !p) return <span>{`${total()} ikon, ${$packs.length} paket`}{$q ? ` · ${$list.length.toLocaleString("tr-TR")} sonuç` : ""}</span>
        return [
          <strong>{p.name}</strong>,
          <span class="sc-pack-lic">{p.license}</span>,
          <span>{`${p.count.toLocaleString("tr-TR")} ikon`}</span>,
          <span>{p.mode === "stroke" ? `çizgi (${p.sw ?? 1.75} px)` : "dolgu"}</span>,
          p.version ? <span>{`v${p.version}`}</span> : null,
          $q ? <span>{`${$list.length.toLocaleString("tr-TR")} sonuç`}</span> : null,
          <a href={p.home} target="_blank" rel="noopener">{p.home.replace(/^https:\/\//, "")}</a>,
        ]
      }}
    </div>
    <IconGrid count={() => $list.length} cell={cell} label="İkonlar" empty={$failed ? "Yüklenemedi." : $names || !searching() ? "Sonuç yok." : "Aranıyor…"} />
    <p class="sc-pack-note">Her paket kendi lisans metniyle gelir (<code>hadi-march/icons/&lt;paket&gt;/LICENSE</code>). Marka ikonları (Simple Icons) markalarının sahiplerine aittir.</p>
  </Demo>
}

function ByName() {
  let $ref = "lucide:rocket"
  const shown = ["user", "lucide:rocket", "tabler:chart-bar", "phosphor:planet", "material-symbols:bolt", "simple-icons:github"]
  void loadIndex().then(registerGalleryPacks, () => {})
  return <Demo wide title="İsimle ikon" desc="Paketi kaydet, ikonu adıyla çağır: önek paketi seçer, öneksiz ad March setidir. Paket ilk kullanımda tembel yüklenir."
    code={`import { registerIconPack, icon, Icon } from "hadi-march/icons/packs"
import lucide from "hadi-march/icons/lucide/pack"
import tabler from "hadi-march/icons/tabler/pack"

registerIconPack(lucide)
registerIconPack(tabler)

<Icon name="lucide:rocket" size="xl" />
<Icon name="user" />                 // no prefix: the March set
<Button icon={icon("tabler:chart-bar")}>Rapor</Button>  // any icon prop; reactive, empty until the pack loads

// your own set: { id, name, license, resolve(name) → IconDef | Promise }
registerIconPack({ id: "hadi", name: "HADİ", license: "MIT", resolve: (n) => hadiIcons[n] })`}>
    <div class="sc-byname">
      {shown.map((n) => <button type="button" class="sc-byname-item" on:click={() => { $ref = n }} title={n}><NamedIcon name={n} size="xl" /><code>{n}</code></button>)}
    </div>
    <TextInput bind:value={$ref} aria-label="İkon adı" placeholder="paket:ad" />
    <div class="sc-byname-live" aria-live="polite">
      <NamedIcon name={$ref} size="xl" label={$ref} />
      <span>{() => icon($ref).d.length ? `<Icon name="${$ref}" />` : "Bu adla ikon yok (ya da paket yükleniyor)."}</span>
    </div>
  </Demo>
}

function StrokeFillRtl() {
  const set: [string, IconDef][] = [["Lucide", lucideArrow], ["Tabler", tablerArrow], ["Heroicons", heroArrow], ["Feather", featherArrow],
    ["Phosphor", phosphorArrow], ["Material Symbols", arrowBack], ["Remix", arrowLeftLine], ["Bootstrap", bootstrapArrow], ["Lucide undo", undo2]]
  return <Demo wide title="Çizgi, dolgu ve sağdan sola" desc="Her paket kendi ızgarası, çizgi kalınlığı ya da dolgusuyla çizilir; renk currentColor, boyut size'dan gelir. Yön bildiren ikonlar (ok, geri, geri al) sağdan sola metinde kendiliğinden aynalanır."
    code={`import { Icon } from "hadi-march/icons"
import { arrowLeft } from "hadi-march/icons/lucide"      // stroke, 24 grid, 2 px
import { arrowBack } from "hadi-march/icons/material-symbols" // fill, 960 grid

<Icon of={arrowLeft} />   // in <div dir="rtl"> it points the other way
<Icon of={arrowBack} />`}>
    {(["ltr", "rtl"] as const).map((dir) =>
      <div class="sc-dir-row" dir={dir}>
        <span class="sc-dir-tag">{dir === "ltr" ? "Soldan sağa" : "Sağdan sola"}</span>
        {set.map(([name, d]) => <span class="sc-dir-cell" title={name}><Icon of={d} size="xl" label={name} /><small>{name}</small></span>)}
      </div>)}
  </Demo>
}

export default function Icons() {
  return <Section kicker="Temel" title="İkonlar" lead={`${ALL.length} özgün ikon ve isteğe bağlı açık kaynak ikon paketleri (Lucide, Tabler, Heroicons, Phosphor, Feather, Material Symbols, Remix, Bootstrap, Simple Icons). Her ikon ayrı dışa aktarım: yalnız kullanılan pakete girer. SVG createElementNS ile üretilir (innerHTML yok), rengi ve boyutu metinden alır.`}>
    <MarchSet />
    <PackGallery />
    <ByName />
    <StrokeFillRtl />
  </Section>
}
