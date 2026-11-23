// Showcase stage for ProjectDetail: grid and detail with the shared element transition between them.
import { ProjectDetail, type ProjectDetails, ProjectGrid, type Project } from "march/landing";
import { PROJECTS, Cover } from "../project-grid/demo.tsx";
import { sharedTransition } from "march/motion";
import { effect, untrack } from "march";

export const code = `let $open: Project | null = null
const open = (p, cover) => sharedTransition(\`project-\${p.id}\`, cover, () => { $open = p })
<If when={$open}>{(p) => <ProjectDetail project={p} onBack={() => $open = null} next={{ project: nextOf(p), onOpen: open }} />}
<Else><ProjectGrid projects={work} onOpen={open} /></Else></If>`

export const details = (p: Project): ProjectDetails => ({
  ...p, role: "Tasarım ve ön yüz", client: p.title, services: ["Kimlik", "Web sitesi", "Hareket"],
  body: [<p>Kısa bir keşif haftasıyla başladık: kullanıcılarla konuşup en sık yapılan üç işi belirledik.</p>, <p>Kimlik, tek bir hareket fikri üzerine kuruldu; web sitesi aynı ritmi yalnız transform ve opacity ile taşıyor.</p>],
  gallery: [<Cover n={(PROJECTS.indexOf(p) + 1) % 6} /> as Node, <Cover n={(PROJECTS.indexOf(p) + 2) % 6} /> as Node, <Cover n={(PROJECTS.indexOf(p) + 3) % 6} /> as Node],
})

export default function ProjectDetailDemo(props: { values: { sample: boolean; gallery: boolean; next: boolean; facts: boolean; color: string; reveal: string } }) {
  let $open: Project | null = null
  // the cover morphs both ways: the card cover and the detail cover share the name project-<id>
  const open = (p: Project, cover: Element) => { void sharedTransition(`project-${p.id}`, cover, () => { $open = p }) }
  const back = (p: Project) => { void sharedTransition(`project-${p.id}`, document.querySelector(".m-pd-cover"), () => { $open = null }) }
  // both options shape the detail page: changing one while the grid shows opens the first project, so it is seen at once
  let first = true
  effect(() => {
    void { ...props.values }
    if (first) { first = false; return }
    untrack(() => { if (!$open) $open = PROJECTS[0]! })
  })
  return <div class="sc-pd-stage">
    {() => {
      const p = $open, v = { ...props.values }
      // no sample project: the grid alone (the detail page needs a project)
      if (!p || !v.sample) return <ProjectGrid projects={PROJECTS} onOpen={open} allLabel="Tümü" />
      const d = details(p), n = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length]!
      return <ProjectDetail project={v.gallery ? d : { ...d, gallery: undefined }} onBack={() => back(p)}
        next={v.next ? { project: n, onOpen: open } : undefined} facts={v.facts}
        m:color={v.color === "default" ? undefined : v.color as "brand-orange"}
        reveal={v.reveal === "off" ? false : { effect: v.reveal as "up" }} />
    }}
  </div>
}
