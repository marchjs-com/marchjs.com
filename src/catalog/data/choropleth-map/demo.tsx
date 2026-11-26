// Showcase stage for ChoroplethMap: Turkey's 81 provinces by population, rainfall or altitude. "Sonraki veri" switches
// the dataset (the provinces morph to their new colours with `animate`), the region chips glide the view there
// (`focus`), and every option of the card reaches the map; a click on a province names it.
import { ChoroplethMap } from "march/components/data/choropleth-map";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<ChoroplethMap data={$population} id="plate" value="people" bins={[250, 500, 1000, 2000, 4000]} title="İllere göre nüfus" />
<ChoroplethMap data={rain} id="il" value="mm" colorScale="diverging" focus={["Rize", "Trabzon", "Artvin"]} labels />`

// values in plate-code order (1 Adana … 81 Düzce); rounded, approximate
// population: thousands, TÜİK ADNKS 2023
const PEOPLE = [2270, 610, 748, 511, 335, 5803, 2696, 169, 1162, 1276, 228, 286, 354, 321, 274, 3215, 563, 200, 527, 1059, 1818, 414, 591, 239, 750, 915, 2164, 462, 151, 288,
  1545, 445, 1916, 15656, 4480, 275, 389, 1446, 369, 243, 2103, 2320, 581, 743, 1476, 1117, 889, 1067, 399, 310, 365, 776, 344, 1101, 1378, 332, 221, 635, 1142, 596,
  824, 89, 2214, 375, 1128, 418, 589, 433, 86, 261, 279, 634, 571, 203, 93, 204, 305, 252, 155, 558, 410];
// yearly rainfall in the province centre, mm (long-term averages)
const RAIN = [670, 720, 420, 520, 460, 390, 1070, 700, 650, 580, 450, 950, 1170, 550, 430, 700, 620, 420, 440, 560, 490, 600, 410, 380, 440, 380, 560, 1270, 470, 760,
  1140, 520, 600, 820, 700, 500, 480, 390, 560, 380, 800, 320, 560, 380, 730, 730, 650, 1150, 770, 410, 330, 1050, 2300, 840, 700, 700, 680, 430, 580, 450,
  820, 860, 460, 540, 390, 590, 1220, 340, 440, 330, 370, 480, 690, 1030, 560, 260, 750, 470, 500, 820, 830];
// altitude of the province centre, m
const ALT = [25, 670, 1030, 1640, 410, 890, 40, 300, 60, 140, 500, 1150, 1545, 730, 950, 155, 5, 750, 800, 350, 670, 45, 1070, 1185, 1850, 790, 850, 5, 1150, 1720,
  85, 1050, 10, 40, 5, 1770, 800, 1050, 200, 985, 10, 1020, 970, 960, 70, 570, 1080, 650, 1350, 1220, 1230, 5, 10, 30, 5, 900, 30, 1285, 5, 620,
  30, 920, 520, 920, 1725, 1300, 10, 980, 1550, 1030, 750, 540, 1400, 25, 1830, 860, 5, 280, 680, 120, 150];

const SETS = [
  { name: "Nüfus", title: "İllere göre nüfus", values: PEOPLE, bins: [250, 500, 1000, 2000, 4000], format: (v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} milyon` : `${v} bin`) },
  { name: "Yağış", title: "Yıllık yağış", values: RAIN, bins: [400, 500, 700, 1000, 1500], format: (v: number) => `${v.toLocaleString("tr-TR")} mm` },
  { name: "Rakım", title: "İl merkezlerinin rakımı", values: ALT, bins: [100, 500, 1000, 1500], format: (v: number) => `${v.toLocaleString("tr-TR")} m` },
];

// Turkey's seven geographic regions (plate codes)
const REGIONS: { name: string; plates: number[] }[] = [
  { name: "Marmara", plates: [22, 39, 59, 34, 41, 54, 77, 16, 11, 10, 17] },
  { name: "Ege", plates: [35, 45, 9, 20, 48, 64, 43, 3] },
  { name: "Akdeniz", plates: [7, 32, 15, 33, 1, 80, 31, 46] },
  { name: "İç Anadolu", plates: [6, 42, 70, 68, 51, 50, 40, 71, 18, 66, 38, 58, 26] },
  { name: "Karadeniz", plates: [14, 81, 67, 74, 78, 37, 57, 55, 5, 60, 19, 52, 28, 61, 53, 8, 29, 69] },
  { name: "Doğu Anadolu", plates: [25, 24, 36, 4, 76, 75, 44, 23, 62, 12, 49, 13, 65, 30] },
  { name: "Güneydoğu", plates: [27, 79, 2, 63, 21, 47, 72, 56, 73] },
];

type V = { colorScale: string; bins: string; labels: string; legend: string; zoom: boolean; tooltip: boolean; missing: boolean; noData: string; animate: string; title: string };

export default function ChoroplethMapDemo(props: { values: V }) {
  let $set = 0
  let $region = ""
  let $picked = ""
  const rows = () => {
    const s = SETS[$set]!
    return s.values.map((value, i) => ({ plate: i + 1, value })).filter((r) => !(props.values.missing && r.plate % 7 === 0))
  }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $set = ($set + 1) % SETS.length }}>{() => `Sonraki veri: ${SETS[($set + 1) % SETS.length]!.name}`}</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir ile tıkla ya da Tab ile gel, oklarla gez; Ctrl + tekerlek yakınlaştırır")}</span>
    </div>
    <div class="sc-row">
      <Button size="sm" variant={() => ($region ? "ghost" : "secondary")} on:click={() => { $region = "" }}>Tüm Türkiye</Button>
      {REGIONS.map((r) => <Button size="sm" variant={() => ($region === r.name ? "secondary" : "ghost")} on:click={() => { $region = r.name }}>{r.name}</Button>)}
    </div>
    {() => {
      const v = props.values
      return <ChoroplethMap data={rows} id="plate" value="value"
        format={(x: number) => SETS[$set]!.format(x)}
        colorScale={v.colorScale === "custom" ? ["#fef3c7", "#f59e0b", "#7c2d12"] : (v.colorScale as "sequential")}
        bins={v.bins === "five" ? 5 : v.bins === "continuous" ? undefined : SETS[$set]!.bins}
        labels={v.labels === "none" ? false : (v.labels as "name")}
        legend={v.legend === "none" ? false : (v.legend as "bottom")}
        zoom={v.zoom} tooltip={v.tooltip}
        noData={v.noData === "gray" ? "--m-surface-3" : v.noData === "none" ? "transparent" : undefined}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 60 } : v.animate}
        focus={REGIONS.find((r) => r.name === $region)?.plates ?? null}
        title={(v.title === "İllere göre nüfus" ? SETS[$set]!.title : v.title) || undefined}
        xLabel="İl" yLabel={SETS[$set]!.name}
        onSelect={(p) => { $picked = `${p.name}: ${p.label}` }} />
    }}
  </div>
}
