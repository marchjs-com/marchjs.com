// A section page with one page per topic (topics.ts): /<section> is the overview (the topics as grouped cards),
// /<section>/<topic> draws that topic with links to the previous and next one. The section's page module gives the
// texts and one draw function per topic slug; an old /<section>#<demo> link moves to the topic that has the demo.
import "./hub.css";
import { computed } from "hadi-march";
import { Link, navigate, type Href } from "hadi-march/router";
import { Icon, arrowLeft, arrowRight } from "hadi-march/icons";
import { Section } from "./demo.tsx";
import { HUBS } from "./topics.ts";

export interface HubProps {
  /** The section's path (a key of topics.ts HUBS). */
  section: string;
  kicker: string;
  title: string;
  lead: string;
  /** One draw function per topic slug (topics.ts). */
  render: Record<string, () => unknown>;
  params?: { rest?: string } | undefined;
}

export function Hub(props: HubProps) {
  const base = props.section
  const topics = HUBS[base] ?? []
  const slug = computed(() => (props.params?.rest ?? "").split("/")[0] ?? "")
  // an old link to a demo on the one long page (/editors#c-composite-terminal) opens the topic that has it
  const hash = globalThis.location?.hash.slice(1)
  if (hash && !props.params?.rest) void import("./sections.gen.ts").then(({ SECTIONS }) => {
    const s = SECTIONS.find((x) => x.id === hash && x.path.startsWith(`${base}/`))
    if (s) void navigate(`${s.path}#${s.id}` as never, { replace: true })
  })
  return <>{() => {
    const at = topics.findIndex((t) => t.slug === slug())
    if (at < 0) return <Overview section={base} kicker={props.kicker} title={props.title} lead={props.lead} />
    const t = topics[at]!, prev = topics[(at - 1 + topics.length) % topics.length]!, next = topics[(at + 1) % topics.length]!
    const draw = props.render[t.slug]
    return <Section kicker={props.title} title={t.title} lead={t.desc}>
      <div class="sc-topic-body">{draw ? draw() : <p class="m-muted">Bu sayfa hazırlanıyor.</p>}</div>
      <nav class="sc-topic-pager" aria-label={`${props.title}: sayfalar`}>
        <Link href={`${base}/${prev.slug}` as Href} class="sc-topic-step"><Icon of={arrowLeft} /><span><small>Önceki</small>{prev.title}</span></Link>
        <Link href={base as Href} class="sc-topic-all">{`Tüm ${props.title.toLocaleLowerCase("tr")}`}</Link>
        <Link href={`${base}/${next.slug}` as Href} class="sc-topic-step sc-topic-next"><span><small>Sonraki</small>{next.title}</span><Icon of={arrowRight} /></Link>
      </nav>
    </Section>
  }}</>
}

/** The topics as cards, by group, in the order topics.ts lists them. */
function Overview(props: { section: string; kicker: string; title: string; lead: string }) {
  const base = props.section
  const topics = HUBS[base] ?? []
  const groups = [...new Set(topics.map((t) => t.group))]
  return <Section kicker={props.kicker} title={props.title} lead={props.lead}>
    {groups.map((g) => <section class="sc-hub-group" aria-labelledby={`hub-${base.slice(1)}-${groups.indexOf(g)}`}>
      <h2 class="sc-hub-group-title" id={`hub-${base.slice(1)}-${groups.indexOf(g)}`}>{g}</h2>
      <div class="sc-hub-grid">
        {topics.filter((t) => t.group === g).map((t) => <Link href={`${base}/${t.slug}` as Href} class="sc-hub-card">
          <strong class="sc-hub-card-title">{t.title}</strong>
          <span class="sc-hub-card-desc">{t.desc}</span>
          <Icon of={arrowRight} class="sc-hub-card-go" />
        </Link>)}
      </div>
    </section>)}
  </Section>
}
