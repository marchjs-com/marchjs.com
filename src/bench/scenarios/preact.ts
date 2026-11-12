// The preact apps of the realistic scenarios, bundled into the preact benchmark chunk (../apps/preact.ts re-exports this):
// one chunk holds the library runtime and every app that uses it (the showcase's per-part budget and HTML-string
// check exempt only that chunk). Add a scenario here when its folder gets a preact app.
import { mount as ticker } from "./ticker/preact.ts"
import { mount as tree } from "./tree/preact.ts"
import { mount as derived } from "./derived/preact.ts"
import { mount as theme } from "./theme/preact.ts"

export const scenarios = { ticker, tree, derived, theme }
