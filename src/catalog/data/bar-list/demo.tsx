// Showcase stage for BarList: this week's most played songs of a small radio. "Bir dinleme daha" adds plays to a random
// song (the order changes, the bars grow), every option reaches the list, and a row click names the song.
import { BarList } from "march/charts";
import { Button } from "march/actions";
import { plus } from "march/icons";

export const code = `<BarList data={$songs} x="title" y="plays" title="En çok dinlenenler" />
<BarList data={countries} limit={5} format="compact" color={2} onSelect={(r) => open(r.datum)} />`

const SONGS = [
  { title: "Sabah Kahvesi", plays: 4210 }, { title: "Yağmurdan Sonra", plays: 3880 }, { title: "Boğaz Rüzgârı", plays: 2950 },
  { title: "Gece Otobüsü", plays: 2410 }, { title: "Eski Plaklar ve Çok Uzun Bir İsim", plays: 1730 }, { title: "Pazar Kahvaltısı", plays: 960 },
];

type V = { sort: boolean; limit: number; format: string; color: number; clickable: boolean; title: string };

export default function BarListDemo(props: { values: V }) {
  let $songs = SONGS
  let $k = 1
  let $picked = ""
  const play = () => { const i = ($k * 7) % $songs.length; $k++; $songs = $songs.map((s, j) => (j === i ? { ...s, plays: s.plays + 900 } : s)) }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={plus} on:click={play}>Bir dinleme daha</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : props.values.clickable ? "Bir satıra tıkla" : "")}</span>
    </div>
    {() => {
      const v = props.values
      return <BarList data={() => $songs} x="title" y="plays" sort={v.sort} limit={v.limit || undefined} color={v.color}
        format={v.format === "money" ? ["money", "TRY"] : v.format} title={v.title || undefined}
        onSelect={v.clickable ? (r) => { $picked = `${r.rank}. ${r.label} (${r.value.toLocaleString("tr")})` } : undefined} />
    }}
  </div>
}
