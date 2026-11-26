// The workbench's Parçalar tab: the Turkish title and one sentence of a component from its topic page (topics.ts, every
// menu page's tables, ~18 KB). Loaded when that tab first opens, not with every component page (march.config.js › allow).
import { HUBS } from "./topics.ts";
import type { Topic } from "./topics/types.ts";

/** The topic of a card: its showcase page `w` ("/<hub>/<slug>") and March name `n`. */
export const topicOf = (w: string | undefined, n: string): Topic | undefined => {
  const [, hub, slug] = (w ?? "").split("/")
  return HUBS[`/${hub ?? ""}`]?.find((t) => t.slug === slug && (!t.name || t.name === n))
}
