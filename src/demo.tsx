// Showcase block (the one DemoCard every page uses): title, description, live preview and, if given, a Code tab.
// The Code tab is a widget point (demo-code.tsx, loaded on its first click): `<Widget sources={[codeView]} />` draws
// whatever provider is registered (default: CodeViewer + Copy + Fullscreen; a live editor can replace it).
import { Tabs } from "hadi-march/ui";
import { Await } from "hadi-march";
import { lazy } from "hadi-march/lazy";

// loaded on the first click on "Kod": the Tabs panel is drawn only when its tab opens
const DemoCode = lazy(() => import("./demo-code.tsx"), { placeholder: "text", height: "8rem" })

/** `code`: the Code tab's source, or a loader for it (fetched on the first click on Kod, like the viewer itself). */
/** A section anchor from a title (same as tools/gen-sections.js: the palette jumps to it). */
/** A section anchor from its title: a short hash (ids stay language-neutral; the title is user-visible text). */
export const demoSlug = (s: string): string => { let x = 5381; for (const ch of s) x = (Math.imul(x, 33) ^ ch.codePointAt(0)!) >>> 0; return x.toString(36); };

/** `meta`: a short strip at the end of the tab row (the parts and the API link of a component card). */
export function Demo(props: { title: string; desc?: string; code?: string | (() => Promise<string>); lang?: string; wide?: boolean; id?: string; meta?: unknown; children?: unknown }) {
  const preview = <div class="sc-stage">{props.children}</div>
  return <section class={props.wide ? "sc-demo sc-demo-wide" : "sc-demo"} id={props.id ?? `d-${demoSlug(props.title)}`}>
    <header class="sc-demo-head">
      <h2 class="sc-demo-title">{props.title}</h2>
      {props.desc ? <p class="sc-demo-desc">{props.desc}</p> : null}
    </header>
    {props.code
      ? <Tabs label={props.title} actions={props.meta} tabs={[{ id: "on", label: "Önizleme", content: preview }, { id: "code", label: "Kod", content: () => { const c = props.code!; const view = (s: string) => <DemoCode source={s.trim()} lang={props.lang ?? "tsx"} />; return typeof c === "string" ? view(c) : <Await for={c}>{view}</Await> } }]} />
      : <>{props.meta ? <div class="sc-demo-meta">{props.meta}</div> : null}{preview}</>}
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
