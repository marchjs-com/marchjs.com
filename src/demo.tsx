// Showcase block: title, description, live preview and (if given) a source code tab.
import { Tabs, CodeView } from "hadi-march/ui";

export function Demo(props: { title: string; desc?: string; code?: string; wide?: boolean; children?: unknown }) {
  const preview = <div class="sc-stage">{props.children}</div>
  return <section class={props.wide ? "sc-demo sc-demo-wide" : "sc-demo"}>
    <header class="sc-demo-head">
      <h2 class="sc-demo-title">{props.title}</h2>
      {props.desc ? <p class="sc-demo-desc">{props.desc}</p> : null}
    </header>
    {props.code
      ? <Tabs label={props.title} tabs={[{ id: "on", label: "Önizleme", content: preview }, { id: "code", label: "Kod", content: <CodeView code={props.code.trim()} lang="tsx" copy /> }]} />
      : preview}
  </section>
}

/** Section page frame: large heading + demo grid. */
export function Section(props: { kicker: string; title: string; lead: string; children?: unknown }) {
  return <div class="sc-page">
    <header class="sc-page-head">
      <span class="sc-kicker">{props.kicker}</span>
      <h1 class="sc-h1">{props.title}</h1>
      <p class="sc-lead">{props.lead}</p>
    </header>
    <div class="sc-demos">{props.children}</div>
  </div>
}
