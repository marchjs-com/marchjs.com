// Portfolio sample, a project's detail page: its own part (loaded when idle after the page, before any click, so the
// cover still morphs into it on the first open).
import { ProjectDetail, type Project } from "march/landing";
import { details } from "../catalog/landing/project-detail/demo.tsx";

export default function PortfolioDetail(props: { project: Project; onBack: () => void; next: { project: Project; onOpen: (p: Project, cover: Element) => void } }) {
  return <ProjectDetail project={details(props.project)} onBack={props.onBack} next={props.next} />
}
