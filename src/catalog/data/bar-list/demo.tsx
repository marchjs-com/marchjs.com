// Showcase stage for BarList: this week's most played songs of a small radio. "Bir dinleme daha" adds plays to a random
// song (the bars grow, a song that overtakes another glides up), "Yeni hafta" swaps a song out (it shrinks away, the new
// one grows in); every option reaches the list (`animate`: spring, soft, one after another, off), a row click names the song.
import { BarList } from "march/components/data/bar-list";
import { Button } from "march/components/actions/button";
import { plus, refresh } from "march/icons";

export const code = `<BarList data={$songs} x="title" y="plays" title="En çok dinlenenler" />
<BarList data={countries} limit={5} format="compact" color={2} onSelect={(r) => open(r.datum)} animate={{ stagger: 60 }} />`

const SONGS = [
  { title: "Sabah Kahvesi", plays: 4210 }, { title: "Yağmurdan Sonra", plays: 3880 }, { title: "Boğaz Rüzgârı", plays: 2950 },
  { title: "Gece Otobüsü", plays: 2410 }, { title: "Eski Plaklar ve Çok Uzun Bir İsim", plays: 1730 }, { title: "Pazar Kahvaltısı", plays: 960 },
];

const FRESH = [{ title: "Martılar ve Simit", plays: 2200 }, { title: "Kadıköy Akşamı", plays: 3100 }, { title: "Lodos", plays: 1500 }, { title: "Ada Vapuru", plays: 2700 }];

type V = { sort: boolean; limit: number; format: string; color: number; clickable: boolean; title: string; animate: string };
const anim = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "stagger" ? { stagger: 60 } : a);

export default function BarListDemo(props: { values: V }) {
  let $songs = SONGS
  let $k = 1
  let $picked = ""
  let $week = 0
  // a new week: the weakest song drops out, a new one comes in
  const week = () => { const weakest = $songs.reduce((m, s) => (s.plays < m.plays ? s : m)); $songs = [...$songs.filter((s) => s !== weakest), FRESH[$week % FRESH.length]!]; $week++ }
  const play = () => { const i = ($k * 7) % $songs.length; $k++; $songs = $songs.map((s, j) => (j === i ? { ...s, plays: s.plays + 900 } : s)) }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={plus} on:click={play}>Bir dinleme daha</Button>
      <Button size="sm" variant="ghost" icon={refresh} on:click={week}>Yeni hafta</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : props.values.clickable ? "Bir satıra tıkla" : "")}</span>
    </div>
    {() => {
      const v = props.values
      return <BarList data={() => $songs} x="title" y="plays" sort={v.sort} limit={v.limit || undefined} color={v.color}
        format={v.format === "money" ? ["money", "TRY"] : v.format} title={v.title || undefined} animate={anim(v.animate)}
        onSelect={v.clickable ? (r) => { $picked = `${r.rank}. ${r.label} (${r.value.toLocaleString("tr")})` } : undefined} />
    }}
  </div>
}
