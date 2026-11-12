// The plain-DOM apps of the realistic scenarios (one chunk). Add a scenario when its folder gets vanilla.ts.
import { mount as ticker } from "./ticker/vanilla.ts"
import { mount as tree } from "./tree/vanilla.ts"
import { mount as derived } from "./derived/vanilla.ts"
import { mount as theme } from "./theme/vanilla.ts"
import { mount as hover } from "./hover/vanilla.ts"
import { mount as counters } from "./counters/vanilla.ts"
import { mount as store } from "./store/vanilla.ts"
import { mount as deep } from "./deep/vanilla.ts"
import { mount as grid } from "./grid/vanilla.ts"

export const scenarios = { ticker, tree, derived, theme, hover, counters, store, deep, grid }
