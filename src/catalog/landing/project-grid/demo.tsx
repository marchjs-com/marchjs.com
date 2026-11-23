// Showcase stage for ProjectGrid: illustrated covers (markup), filters; opening shows the Lightbox-less detail note.
import { ProjectGrid, type Project } from "march/components/landing/project-grid";

export const code = `<ProjectGrid projects={work} onOpen={(p, cover) => sharedTransition(\`project-\${p.id}\`, cover, () => { $open = p })} />
<ProjectGrid projects={work} />            // without onOpen: the cover opens in the Lightbox`

const ART = ["a1", "a2", "a3", "a4", "a5", "a6"]
/** A generated cover: layered shapes in theme colours (no image request). */
export const Cover = (p: { n: number }) => <div class={`sc-cover ${ART[p.n % ART.length]}`} aria-hidden="true"><i /><i /><i /></div>

// a cover is a DOM node, and a node lives in one place only: each read makes a new one, so the grid, the detail page
// and the sample portfolio can show the same project at once (a shared node would leave an empty box behind)
const WORK = [
  { id: "aurora-bank", title: "Aurora Bank", category: "Marka", year: 2026, summary: "Yeni kimlik ve web sitesi." },
  { id: "kite-app", title: "Kite uygulaması", category: "Uygulama", year: 2026, summary: "Seyahat planlayıcı, iOS ve Android." },
  { id: "lumen", title: "Lumen panosu", category: "Web", year: 2025, summary: "Gerçek zamanlı analitik." },
  { id: "orbit", title: "Orbit konferansı", category: "Marka", year: 2025, summary: "Etkinlik kimliği ve hareket." },
  { id: "pinecrest", title: "Pinecrest mağaza", category: "Web", year: 2024, summary: "E-ticaret yeniden tasarımı." },
  { id: "quanta", title: "Quanta sağlık", category: "Uygulama", year: 2024, summary: "Hasta takip uygulaması." },
]
export const PROJECTS: Project[] = WORK.map((p, i) => ({ ...p, get cover() { return <Cover n={i} /> as Node } }))

export default function ProjectGridDemo(props: { values: { sample: number; cols: number; filters: boolean; arrow: string; color: string; motion: boolean } }) {
  return <div>
    {() => {
      const v = { ...props.values }
      return <ProjectGrid projects={PROJECTS.slice(0, v.sample)} cols={v.cols as 3} filters={v.filters} allLabel="Tümü" motion={v.motion}
        m:color={v.color === "default" ? undefined : v.color as "brand-purple"}
        arrow={v.arrow === "off" ? false : v.arrow === "own" ? (p: Project) => <span>{p.year}</span> : true} />
    }}
  </div>
}
