// The Mithril apps of the realistic scenarios, bundled into the Mithril benchmark chunk (../apps/mithril.ts re-exports
// this): one chunk holds the library runtime and every app that uses it.
import { mount as ticker } from "./ticker/mithril.ts"
import { mount as tree } from "./tree/mithril.ts"
import { mount as derived } from "./derived/mithril.ts"
import { mount as theme } from "./theme/mithril.ts"
import { mount as hover } from "./hover/mithril.ts"
import { mount as counters } from "./counters/mithril.ts"
import { mount as store } from "./store/mithril.ts"
import { mount as deep } from "./deep/mithril.ts"
import { mount as grid } from "./grid/mithril.ts"
import { mount as startup } from "./startup/mithril.ts"

export const scenarios = { ticker, tree, derived, theme, hover, counters, store, deep, grid, startup }
