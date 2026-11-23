// A section page with one page per topic (topics.ts): /<section> is the overview (a coloured head card with the count,
// a sticky row of group chips and a filter box, then the topics as drawn cards by group), /<section>/<topic> draws
// that topic under its frame: the sibling pages as a strip, the title with its March name, one sentence, the import
// line and the API link. The section's page module gives the texts and one draw function per topic slug; an old
// /<section>#<demo> link moves to the topic that has the demo. A press on a card turns its drawing into the topic's
// stage (a view transition through the page change; a plain change without one).
import "./hub.css";
import { signal, computed, effect, onCleanup } from "march";
import { Link, navigate, type Href } from "march/router";
import { Chip, CopyButton, SearchBox, Grid } from "march/ui";
import { Icon, arrowLeft, arrowRight, copy, code } from "march/icons";
import { cards } from "march/components/cards.gen.ts";
import type { Topic } from "./topics/types.ts";
import { sectionOf, PAGE_META } from "./nav-meta.ts";
import { HubArt, loadArt } from "./hub-art.tsx";
import type { ArtSet } from "./hub-art/types.ts";

export interface HubProps {
  /** The section's path (a key of topics.ts HUBS). */
  section: string;
  /** The section's topics (src/topics/<section>.ts: the page loads only its own list). */
  topics: readonly Topic[];
  kicker: string;
  title: string;
  lead: string;
  /** One draw function per topic slug (topics.ts). */
  render: Record<string, () => unknown>;
  params?: { rest?: string } | undefined;
}

/** The colour of each part of the menu (nav-meta SECTIONS order): the head card and the cards' accent. */
const SECTION_COLOR: Record<string, string> = { start: "brand-orange", components: "brand-blue", look: "brand-purple", motion: "brand-pink", built: "brand-green", infra: "brand-gold" }
const colorOf = (base: string): string => { const group = PAGE_META[base]?.group; return SECTION_COLOR[sectionOf({ path: base, group })?.id ?? ""] ?? "brand-orange" }

/** Set by a card press: the next topic page names its stage so the view transition grows the drawing into it. */
let morphing = false

export function Hub(props: HubProps) {
  const base = props.section
  const topics = props.topics
  const slug = computed(() => (props.params?.rest ?? "").split("/")[0] ?? "")
  // an old link to a demo on the one long page (/editors#c-composite-terminal) opens the topic that has it
  const hash = globalThis.location?.hash.slice(1)
  if (hash && !props.params?.rest) void import("./sections.gen.ts").then(({ SECTIONS }) => {
    const s = SECTIONS.find((x) => x.id === hash && x.path.startsWith(`${base}/`))
    if (s) void navigate(`${s.path}#${s.id}` as never, { replace: true })
  })
  return <>{() => {
    const at = topics.findIndex((t) => t.slug === slug())
    if (at < 0) return <Overview section={base} topics={topics} kicker={props.kicker} title={props.title} lead={props.lead} />
    return <TopicPage section={base} title={props.title} topics={topics} at={at} draw={props.render[topics[at]!.slug]} />
  }}</>
}

/** The import line and API page of the component a topic shows (cards.gen.ts › a: "<slug path>/<name>"). */
function apiOf(t: Topic): { name: string; from: string; href: Href } | null {
  const c = t.name ? cards.find((e) => e.n === t.name && e.a) : undefined
  if (!c?.a) return null
  const path = c.a.split("/").slice(0, -1).join("/")
  return { name: c.n, from: path === "core" ? "march" : `march/${path}`, href: `/api/${c.a}` as Href }
}

/** A topic page: sibling strip, head (title, March name, sentence, import line, API), the topic, previous / next. */
function TopicPage(props: { section: string; title: string; topics: readonly Topic[]; at: number; draw: (() => unknown) | undefined }) {
  const { section: base, topics, at } = props
  const t = topics[at]!, prev = topics[(at - 1 + topics.length) % topics.length]!, next = topics[(at + 1) % topics.length]!
  const api = apiOf(t)
  const line = api ? `import { ${api.name} } from "${api.from}"` : ""
  // arriving from a card: the stage carries the morph's name for the moment of the transition
  const arriving = morphing
  morphing = false
  const strip = (el: Element) => { queueMicrotask(() => el.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" })) }
  return <div class="sc-page sc-topic">
    <nav class="sc-topic-strip" aria-label={`${props.title}: bütün sayfalar`} ref={strip}>
      {topics.map((x) => <Link href={`${base}/${x.slug}` as Href} class="sc-topic-sib" aria-current={x === t ? "page" : null}>{x.title}</Link>)}
    </nav>
    <header class="sc-topic-head">
      <div class="sc-topic-titles">
        <h1 class="sc-h1 sc-topic-h1">{t.title}{t.name ? <code class="sc-topic-name">{t.name}</code> : null}</h1>
        <p class="sc-lead">{t.desc}</p>
      </div>
      {api ? <div class="sc-topic-acts">
        <CopyButton class="sc-topic-import" text={line} label={line} copiedLabel="Kopyalandı" icon={copy} errorText="Panoya kopyalanamadı." />
        <Link class="sc-topic-api" href={api.href} title={`${api.name}: API başvurusu`}><Icon of={code} />API</Link>
      </div> : null}
    </header>
    <div class="sc-demos">
      <div class="sc-topic-body" style={arriving ? { "view-transition-name": "sc-morph" } : {}}
        ref={(el: HTMLElement) => { if (arriving) { const t = setTimeout(() => el.style.removeProperty("view-transition-name"), 900); onCleanup(() => clearTimeout(t)) } }}>
        {props.draw ? props.draw() : <p class="m-muted">Bu sayfa hazırlanıyor.</p>}
      </div>
      <nav class="sc-topic-pager" aria-label={`${props.title}: sayfalar`}>
        <Link href={`${base}/${prev.slug}` as Href} class="sc-topic-step"><Icon of={arrowLeft} /><span><small>Önceki</small>{prev.title}</span></Link>
        <Link href={base as Href} class="sc-topic-all">{`Tüm ${props.title.toLocaleLowerCase("tr")}`}</Link>
        <Link href={`${base}/${next.slug}` as Href} class="sc-topic-step sc-topic-next"><span><small>Sonraki</small>{next.title}</span><Icon of={arrowRight} /></Link>
      </nav>
    </div>
  </div>
}

/** The overview: head card, sticky group chips + filter, the topics as drawn cards by group (topics.ts order). */
function Overview(props: { section: string; topics: readonly Topic[]; kicker: string; title: string; lead: string }) {
  const base = props.section
  const topics = props.topics
  const groups = [...new Set(topics.map((t) => t.group))]
  const group = signal(""), q = signal("")
  const art = signal<ArtSet>({})
  void loadArt(base).then((a) => art.set(a))
  // what the count names: components when every topic shows one, else pages
  const noun = topics.every((t) => t.name) ? "bileşen" : "sayfa"
  const shown = computed(() => {
    const needle = q().trim().toLocaleLowerCase("tr")
    return groups.filter((g) => !group() || g === group()).map((g) => [g, topics.filter((t) => t.group === g && (!needle || `${t.title} ${t.name ?? ""} ${t.desc}`.toLocaleLowerCase("tr").includes(needle)))] as const).filter(([, list]) => list.length)
  })
  // the kicker is the page's menu group (the same word as the menu and the path above), else the page's own
  const kicker = PAGE_META[base]?.group ?? props.kicker
  const label = groups.length > 1 ? `${noun} · ${groups.length} grup` : noun
  // a press on a card: its drawing becomes the topic's stage through the page change (view transitions only)
  const press = (e: MouseEvent) => {
    const card = (e.currentTarget as Element), pic = card.querySelector<HTMLElement>(".sc-hub-art")
    if (!pic || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    morphing = true
    pic.style.setProperty("view-transition-name", "sc-morph")
  }
  const chips = <div class="sc-hub-filter" role="toolbar" aria-label="Grupları süz">
    {groups.length > 1 ? <>
      <Chip selected={() => group() === ""} onClick={() => group.set("")}>Hepsi</Chip>
      {groups.map((g) => <Chip selected={() => group() === g} onClick={() => group.set(group.peek() === g ? "" : g)}>{g}</Chip>)}
    </> : null}
    <SearchBox class="sc-hub-q" size="sm" value={q} onInput={(v: string) => q.set(v)} debounce={0} placeholder="Bu sayfada süz…" label="Bu sayfadaki kartları süz" />
  </div>
  effect(() => { if (q() && group.peek()) group.set("") })
  return <div class="sc-page sc-hub" data-m-color={colorOf(base)}>
    <header class="sc-hub-head">
      <div class="sc-hub-head-text">
        {kicker !== props.title ? <span class="sc-kicker">{kicker}</span> : null}
        <h1 class="sc-h1">{props.title}</h1>
        <p class="sc-lead">{props.lead}</p>
      </div>
      <div class="sc-hub-count" aria-label={`${topics.length} ${label}`}>{topics.length}<small>{label}</small></div>
    </header>
    {chips}
    <div class="sc-hub-groups">
      {() => {
        const list = shown()
        if (!list.length) return <p class="sc-hub-none">Eşleşen kart yok.</p>
        let n = 0
        return list.map(([g, items]) => <section class="sc-hub-group" aria-label={g}>
          {groups.length > 1 ? <h2 class="sc-hub-group-title">{g}</h2> : null}
          <Grid class="sc-hub-grid" cols={4} gap={3} balance equal>
            {items.map((t) => <Link href={`${base}/${t.slug}` as Href} class="sc-hub-card" style={{ "--sc-i": String(Math.min(n++, 14)) }} on:click={press}>
              <span class="sc-hub-art">{() => { const s = art()[t.slug]; return s ? <HubArt shapes={s} /> : null }}</span>
              <span class="sc-hub-card-body">
                <strong class="sc-hub-card-title">{t.title}</strong>
                {t.name ? <code class="sc-hub-card-name">{t.name}</code> : null}
                <span class="sc-hub-card-desc">{t.desc}</span>
              </span>
            </Link>)}
          </Grid>
        </section>)
      }}
    </div>
  </div>
}

