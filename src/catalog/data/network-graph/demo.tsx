// Showcase stage for NetworkGraph: who works with whom in a small studio. "Yeni kişi" pops a newcomer in from the
// middle (the others keep their place, the layout warms up again), "Biri ayrılsın" lets someone shrink away, every
// option of the card reaches the graph, and a click on a node names it and its neighbours.
import { NetworkGraph } from "march/components/data/network-graph";
import { Button } from "march/components/actions/button";
import { plus, users } from "march/icons";

export const code = `<NetworkGraph nodes={$people} links={$works} group="team" value="posts"
  groupLabels={{ design: "Tasarım", mobile: "Mobil", web: "Web", data: "Veri" }} title="Stüdyo ağı" />`

type Person = { id: string; label: string; team: string; posts: number };
type Link = { source: string; target: string; value: number };
const NAMES = ["Ece", "Can", "Deniz", "Mert", "Zeynep", "Arda", "Elif", "Kaan", "Selin", "Emre", "Defne", "Onur", "İpek", "Bora", "Nil", "Kerem",
  "Ada", "Tuna", "Lale", "Berk", "Su", "Ozan", "Ela", "Umut", "Gizem", "Efe", "Naz", "Barış"];
const TEAMS = ["design", "mobile", "web", "data"];
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const person = (i: number, r: () => number): Person => ({ id: `p${i}`, label: NAMES[i % NAMES.length]!, team: TEAMS[i % 4]!, posts: Math.round(4 + r() * 60) });
// mostly inside the team, a few bridges between teams
const linksFor = (p: Person, others: readonly Person[], r: () => number): Link[] => {
  const mates = others.filter((o) => o.team === p.team), rest = others.filter((o) => o.team !== p.team), out: Link[] = [];
  for (const o of mates) if (r() < 0.55) out.push({ source: p.id, target: o.id, value: 1 + Math.round(r() * 3) });
  if (rest.length && r() < 0.45) out.push({ source: p.id, target: rest[Math.floor(r() * rest.length)]!.id, value: 1 });
  if (!out.length && others.length) out.push({ source: p.id, target: others[Math.floor(r() * others.length)]!.id, value: 1 });
  return out;
};

type V = { layout: string; charge: number; linkDistance: number; collide: boolean; nodeSize: string; labels: string; directed: boolean; zoom: boolean; draggable: boolean;
  legend: string; colors: string; animate: string; height: number; title: string };

export default function NetworkGraphDemo(props: { values: V }) {
  const r = rng(11)
  const start = Array.from({ length: 18 }, (_, i) => person(i, r))
  let $people = start
  let $links = start.flatMap((p, i) => linksFor(p, start.slice(0, i), r))
  let $n = start.length
  let $picked = ""
  const add = () => {
    const p = person($n++, r)
    $links = [...$links, ...linksFor(p, $people, r)]
    $people = [...$people, p]
  }
  const remove = () => {
    if ($people.length < 4) return
    const gone = $people[Math.floor(r() * $people.length)]!
    $people = $people.filter((p) => p !== gone)
    $links = $links.filter((l) => l.source !== gone.id && l.target !== gone.id)
  }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={plus} on:click={add}>Yeni kişi</Button>
      <Button size="sm" variant="ghost" icon={users} on:click={remove}>Biri ayrılsın</Button>
      <span class="m-muted">{() => ($picked ? $picked : "Bir düğümü sürükle, tekerlekle yakınlaş; Tab ile gel, oklarla komşuya geç")}</span>
    </div>
    {() => {
      const v = props.values
      return <NetworkGraph nodes={() => $people} links={() => $links} group="team" value="posts" layout={v.layout as "force"}
        charge={v.charge} linkDistance={v.linkDistance} collide={v.collide} nodeSize={v.nodeSize === "small" ? [3, 9] : v.nodeSize === "big" ? [8, 26] : [5, 16]}
        labels={v.labels === "hover" ? "hover" : v.labels === "on"} directed={v.directed} zoom={v.zoom} draggable={v.draggable}
        legend={v.legend === "none" ? false : v.legend === "auto" ? undefined : (v.legend as "right")}
        colors={v.colors === "brand" ? ["var(--m-brand-orange)", "var(--m-brand-blue)", "var(--m-brand-green)", "var(--m-brand-purple)"] : undefined}
        groupLabels={{ design: "Tasarım", mobile: "Mobil", web: "Web", data: "Veri" }}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 40 } : v.animate}
        height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.label}: ${p.degree} bağlantı (${p.neighbors.map((id) => $people.find((x) => x.id === id)?.label).join(", ")})` }} />
    }}
  </div>
}
