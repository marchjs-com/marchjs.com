// The react apps of the realistic scenarios, bundled into the react benchmark chunk (../apps/react.ts re-exports this):
// one chunk holds the library runtime and every app that uses it (the showcase's per-part budget and HTML-string
// check exempt only that chunk). Add a scenario here when its folder gets a react app.
import { mount as ticker } from "./ticker/react.ts"
import { mount as tree } from "./tree/react.ts"
import { mount as derived } from "./derived/react.ts"
import { mount as theme } from "./theme/react.ts"
import { mount as hover } from "./hover/react.ts"
import { mount as counters } from "./counters/react.ts"

export const scenarios = { ticker, tree, derived, theme, hover, counters }
