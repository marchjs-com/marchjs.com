// Showcase stage for Treemap: a phone's storage, folder by folder. "Sonraki ay" moves the gigabytes (tiles glide to
// their new rectangles), a click on a group zooms into it (the crumbs and Escape go back), and every option of the card
// reaches the chart. The color option switches from folders to the month's change (a diverging scale around 0).
import { Treemap } from "march/components/data/treemap";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<Treemap data={$storage} value="gb" format={(v) => \`\${v} GB\`} title="Depolama" />
<Treemap data={$storage} value="gb" colorValue="change" colorScale="diverging" colorMid={0} depth={3} />`

interface Node { name: string; gb?: number; change?: number; children?: Node[] }
const BASE: Node[] = [
  { name: "Fotoğraflar", children: [{ name: "Tatil 2026", gb: 14.2 }, { name: "Aile", gb: 9.8 }, { name: "Videolar", gb: 18.4 }, { name: "Ekran görüntüleri", gb: 3.1 }] },
  { name: "Uygulamalar", children: [
    { name: "Oyunlar", children: [{ name: "Sakin Bahçe", gb: 4.2 }, { name: "Kule", gb: 2.9 }, { name: "Kelime Avı", gb: 1.1 }] },
    { name: "Sosyal", gb: 6.1 }, { name: "Haritalar", gb: 2.3 }, { name: "Müzik", gb: 5.6 }] },
  { name: "Mesajlar", children: [{ name: "Sohbetler", gb: 4.4 }, { name: "Ekler", gb: 7.2 }, { name: "Sesli notlar", gb: 1.6 }] },
  { name: "Podcastler", children: [{ name: "İndirilenler", gb: 3.8 }, { name: "Çalma listeleri", gb: 2.2 }] },
  { name: "Sistem", gb: 11 },
];
// each month every leaf grows or shrinks by a fixed pattern: the change field is that month's percent
const month = (m: number): Node[] => {
  let k = 0;
  const walk = (n: Node): Node => {
    if (n.children) return { name: n.name, children: n.children.map(walk) };
    const f = m === 0 ? 0 : Math.sin(++k * 2.3 + m * 1.7) * 0.45;
    return { name: n.name, gb: Math.max(0.3, Math.round((n.gb ?? 0) * (1 + f) * 10) / 10), change: Math.round(f * 100) };
  };
  return BASE.map(walk);
};
const MONTHS = [month(0), month(1), month(2), month(3)];

type V = { depth: number; color: string; colorScale: string; labels: boolean; valueLabels: boolean; padding: number; radius: number; drill: boolean;
  breadcrumbs: boolean; animate: string; legend: string; height: number; title: string };

export default function TreemapDemo(props: { values: V }) {
  let $month = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $month = ($month + 1) % MONTHS.length }}>Sonraki ay</Button>
      <span class="m-muted">{() => ($picked || "Bir klasöre tıkla: içine girer · Esc geri çıkar · Tab ve oklarla gez")}</span>
    </div>
    {() => {
      const v = props.values
      const byChange = v.color === "change"
      return <Treemap data={() => MONTHS[$month]!} value="gb" format={(x: number) => `${Math.round(x * 10) / 10} GB`}
        depth={v.depth} colorValue={byChange ? "change" : undefined} colorScale={v.colorScale as "diverging"} colorMid={v.colorScale === "diverging" ? 0 : undefined}
        colorFormat={(x: number) => `%${x}`} labels={v.labels} valueLabels={v.valueLabels} padding={v.padding} radius={v.radius}
        drill={v.drill} breadcrumbs={v.breadcrumbs} rootLabel="Telefon"
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 30 } : v.animate}
        legend={v.legend === "none" ? false : (v.legend as "bottom")} height={v.height} title={v.title || undefined}
        onDrill={(p) => { $picked = p ? `Açılan: ${p.path.join(" › ")}` : "" }}
        onSelect={(p) => { $picked = `Seçilen: ${p.label} (${Math.round(p.value * 10) / 10} GB, %${Math.round(p.share * 100)})` }} />
    }}
  </div>
}
