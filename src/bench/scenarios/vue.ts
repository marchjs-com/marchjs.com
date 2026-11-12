// The vue apps of the realistic scenarios, bundled into the vue benchmark chunk (../apps/vue.ts re-exports this):
// one chunk holds the library runtime and every app that uses it (the showcase's per-part budget and HTML-string
// check exempt only that chunk). Add a scenario here when its folder gets a vue app.
import { mount as ticker } from "./ticker/vue.ts"
import { mount as tree } from "./tree/vue.ts"
import { mount as derived } from "./derived/vue.ts"
import { mount as theme } from "./theme/vue.ts"
import { mount as hover } from "./hover/vue.ts"
import { mount as counters } from "./counters/vue.ts"
import { mount as store } from "./store/vue.ts"

export const scenarios = { ticker, tree, derived, theme, hover, counters, store }
