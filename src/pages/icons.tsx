// İkonlar: bütün set, arama, boyutlar. Her ikon ayrı dışa aktarım (kullanılmayanlar pakete girmez).
// the gallery reads the catalog (one separate module), so the icon set does not load with every page
import { ICONS } from "hadi-march/icons/catalog";
import { Icon, type IconDef } from "hadi-march/icons";
import { SearchBox, toast, Segmented } from "hadi-march/ui";
import { Demo, Section } from "../demo.tsx";

const ALL = Object.entries(ICONS) as [string, IconDef][];

export default function Icons() {
  let $q = ""
  let $size = "lg"
  const list = () => ALL.filter(([name, d]) => !$q || name.toLowerCase().includes($q.toLowerCase()) || d.name.includes($q.toLowerCase()))
  return <Section kicker="Temel" title="İkonlar" lead={`${ALL.length} özgün ikon; 24'lük ızgara, 1,75 px yuvarlak çizgi. SVG createElementNS ile üretilir (innerHTML yok), rengi ve boyutu metinden alır.`}>
    <Demo wide title="İkon seti" desc="Ara, boyut seç, ikona tıkla: içe aktarma satırı kopyalanır."
      code={`import { Icon, users, search } from "hadi-march/icons"

<Icon of={users} size="lg" />
<Button icon={search}>Ara</Button>   // her icon prop'u ikon alır`}>
      <div class="sc-row sc-row-between">
        <SearchBox bind:value={$q} placeholder="İkon ara (ör. user, chart)" shortcut />
        <Segmented bind:value={$size} aria-label="Boyut" options={[{ value: "md", label: "16" }, { value: "lg", label: "20" }, { value: "xl", label: "24" }]} />
      </div>
      <div class="sc-icons">
        <For each={list()} key={([n]: [string, IconDef]) => n}>{(e: () => [string, IconDef]) =>
          <button type="button" class="sc-icon" title={e()[0]} on:click={() => { void navigator.clipboard?.writeText(`import { ${e()[0]} } from "hadi-march/icons"`); toast(`${e()[0]} kopyalandı`, { kind: "success" }) }}>
            {() => <Icon of={e()[1]} size={$size as "md" | "lg" | "xl"} />}
            <span>{e()[0]}</span>
          </button>}
        </For>
      </div>
    </Demo>
  </Section>
}
