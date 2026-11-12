// The realistic scenarios, in page order. A scenario lives in its own folder: <id>/def.ts (data, step plan, DOM
// check, an honest description) and one app per library; ./<library>.ts files register the apps.
import type { Scenario } from "./core.ts"
import { ticker } from "./ticker/def.ts"
import tree from "./tree/def.ts"
import derived from "./derived/def.ts"
import theme from "./theme/def.ts"
import hover from "./hover/def.ts"
import counters from "./counters/def.ts"

export const SCENARIOS: Scenario[] = [ticker as Scenario, tree as Scenario, derived as Scenario, counters as Scenario, theme as Scenario, hover as Scenario]
export const scenarioById = (id: string): Scenario | undefined => SCENARIOS.find((s) => s.id === id)
