// One showcase card for a component folder (src/components/<name>/): the workbench (workbench.tsx) around its
// demo.tsx: a stage box (toolbar, stage, code) beside the options panel built from playground.ts. New components
// appear by adding the folder, not by editing pages.
// A component with its own package entry (meta.entry) has no lazy loader in the registry: its page passes `view` and
// `spec` (imported statically) and the card draws them at once.
// This file stays small (every component page imports it); the workbench itself is one lazy part.
import { lazy } from "march/lazy";
import { cards, cardCode } from "march/components/cards.gen.ts";
import type { PlaygroundSpec } from "march/ui";

export type DemoView = (p: { values: never }) => unknown

/** The anchor of a component demo on its page ("landing/hero" → "c-landing-hero"). */
export const demoId = (folder: string): string => "c-" + folder.split("/").join("-")

/** `desc`: what to try in this card (the page heading already says what the component is). */
export function ComponentDemo(props: { folder: string; title?: string; desc?: string; code?: string; view?: DemoView; spec?: PlaygroundSpec<never> }) {
  const entry = cards.find((e) => e.f === props.folder)!
  const Body = lazy(async () => {
    const [{ Workbench }, view, spec, code] = await Promise.all([
      import("./workbench.tsx"),
      props.view ?? entry.demo().then((m) => m.default),
      props.spec ?? entry.playground().then((m) => m.default),
      props.code ?? cardCode(props.folder),
    ])
    return { default: () => <Workbench entry={entry} view={view} spec={spec} code={code} /> }
  }, { placeholder: "card", height: "28rem" })
  return <section class="sc-demo sc-demo-wide sc-wb-card" id={demoId(props.folder)}>
    <header class="sc-demo-head">
      <h2 class="sc-demo-title">{props.title ?? entry.n}</h2>
      {props.desc ? <p class="sc-demo-desc">{props.desc}</p> : null}
    </header>
    <Body />
  </section>
}
