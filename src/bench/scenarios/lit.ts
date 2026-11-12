// The Lit apps of the realistic scenarios, bundled into the Lit benchmark chunk (../apps/lit-app.ts re-exports this,
// loaded after no-tt.ts hid the Trusted Types policy lookup). Add a scenario when its folder gets lit.ts.
import { mount as ticker } from "./ticker/lit.ts"
import { mount as tree } from "./tree/lit.ts"
import { mount as derived } from "./derived/lit.ts"
import { mount as theme } from "./theme/lit.ts"
import { mount as hover } from "./hover/lit.ts"

export const scenarios = { ticker, tree, derived, theme, hover }
