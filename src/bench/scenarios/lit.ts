// The Lit apps of the realistic scenarios, bundled into the Lit benchmark chunk (../apps/lit-app.ts re-exports this,
// loaded after no-tt.ts hid the Trusted Types policy lookup). Add a scenario when its folder gets lit.ts.
import { mount as ticker } from "./ticker/lit.ts"

export const scenarios = { ticker }
