// Motion library pages under one route (/motion/<page>): the entry gains one route, not one per page.
// Pages under the 10 KB chunk minimum are part of this module (the build would fold them into it anyway; importing
// them statically keeps this chunk its own, out of the entry's shared page group); larger pages stay lazy chunks,
// keyed by full path ("/path": () => import(…)) so the size report budgets them as routes.
import { lazy } from "hadi-march/lazy";
import { motionTransition } from "./motion-route-meta.ts";
import MotionMorph from "./pages/motion/morph.tsx";
import MotionPages from "./pages/motion/pages.tsx";

// each page may pick its own transition (the page transition variants page: one per variant)
export const meta = { transition: motionTransition }

type Page = (p: object) => unknown;
const LAZY: Record<string, () => Promise<{ default: Page }>> = {
  "/motion/svg": () => import("./pages/motion/svg.tsx"),
  "/motion/micro": () => import("./pages/motion/micro.tsx"),
  "/motion/scroll": () => import("./pages/motion/scroll.tsx"),
  "/motion/lists": () => import("./pages/motion/lists.tsx"),
}
const LOCAL: Record<string, Page> = { "/motion/morph": MotionMorph, "/motion/pages": MotionPages }
const VIEWS = new Map<string, Page>()
const MotionTopics = lazy(() => import("./pages/motion.tsx"), { placeholder: "card", height: "40rem" }) as (p: { params: { rest?: string } }) => unknown

export default function MotionHub(props: { params: { rest?: string } }) {
  // /motion/pages/<variant> is one page (the variant is its own route for the transition)
  const key = `/motion/${(props.params.rest ?? "").split("/")[0]}`
  const Local = LOCAL[key]
  if (Local) return <Local />
  const load = LAZY[key]
  // the other topics (/motion/spring-tween…) are on the motion page itself (its Hub draws them)
  if (!load) return <MotionTopics params={props.params} />
  let View = VIEWS.get(key)
  if (!View) VIEWS.set(key, (View = lazy(load, { placeholder: "card", height: "40rem" }) as Page))
  return <View />
}
