// The Lit apps of the realistic scenarios, bundled into the Lit benchmark chunk (../apps/lit-app.ts re-exports this,
// loaded after no-tt.ts hid the Trusted Types policy lookup). Add a scenario when its folder gets lit.ts.
import { mount as ticker } from "./ticker/lit.ts"
import { mount as tree } from "./tree/lit.ts"
import { mount as derived } from "./derived/lit.ts"
import { mount as theme } from "./theme/lit.ts"
import { mount as hover } from "./hover/lit.ts"
import { mount as counters } from "./counters/lit.ts"
import { mount as store } from "./store/lit.ts"
import { mount as deep } from "./deep/lit.ts"
import { mount as grid } from "./grid/lit.ts"
import { mount as startup } from "./startup/lit.ts"

export const scenarios = { ticker, tree, derived, theme, hover, counters, store, deep, grid, startup }
