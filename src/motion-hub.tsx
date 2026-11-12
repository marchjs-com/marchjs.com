// Motion library pages under one route (/motion/<page>): each page is its own lazy chunk; the entry gains one route.
// Keys are full paths ("/path": () => import(…)) so the size report budgets each page as a route.
import { lazy } from "hadi-march/lazy";

const PAGES: Record<string, () => Promise<{ default: (p: object) => unknown }>> = {
  "/motion/svg": () => import("./pages/motion/svg.tsx"),
}
const VIEWS = new Map<string, ReturnType<typeof lazy>>()

export default function MotionHub(props: { params: { rest?: string } }) {
  const key = `/motion/${props.params.rest ?? ""}`
  const load = PAGES[key]
  if (!load) return <p class="sc-lead">Sayfa bulunamadı.</p>
  let View = VIEWS.get(key)
  if (!View) VIEWS.set(key, (View = lazy(load, { placeholder: "card", height: "40rem" })))
  return <View />
}
