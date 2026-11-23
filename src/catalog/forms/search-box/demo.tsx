// Showcase stage for SearchBox: a filtered list; the field follows the Playground values (playground.ts).
import { SearchBox } from "march/components/forms/search-box";
import { filter, trash, Icon } from "march/icons";

export const code = `<SearchBox bind:value={$q} onSearch={(q) => load(q)} shortcut />
<SearchBox size="sm" debounce={0} bind:value={$filter} placeholder="Süz…" />
<SearchBox variant="plain" icon={false} clear={false} inputRef={(el) => input = el} />`

const CITIES = ["Adana", "Ankara", "Antalya", "Bursa", "Diyarbakır", "Eskişehir", "Gaziantep", "İstanbul", "İzmir", "Konya", "Trabzon", "Van"]

interface Values { size: string; variant: string; icon: string; clear: string; debounce: number; shortcut: boolean; shortcutHint: boolean; placeholder: string }

export default function SearchBoxDemo(props: { values: Values }) {
  let $q = "an"
  let $typed = "an"
  const $found = CITIES.filter((c) => c.toLocaleLowerCase("tr").includes($q.toLocaleLowerCase("tr")))
  return <div class="sc-a6-panel sc-a6-pad">
    {() => {
      const v = { ...props.values }
      const icon = v.icon === "off" ? false : v.icon === "own" ? <Icon of={filter} /> : true
      const clear = v.clear === "off" ? false : v.clear === "own" ? <Icon of={trash} /> : true
      return <SearchBox bind:value={$q} onInput={(x) => $typed = x} size={v.size as "md"} variant={v.variant as "field"} icon={icon} clear={clear} debounce={v.debounce}
        shortcut={v.shortcut} shortcutHint={v.shortcutHint} placeholder={v.placeholder} />
    }}
    <p class="sc-demo-call">{() => `gecikme ${props.values.debounce} ms · yazılan: "${$typed}" · değer: "${$q}" · ${$found.length} sonuç`}</p>
    <ul class="sc-a6-list">{() => $found.map((c) => <li>{c}</li>)}</ul>
  </div>
}
