// The react apps of the realistic scenarios, bundled into the react benchmark chunk (../apps/react.ts re-exports this):
// one chunk holds the library runtime and every app that uses it (the showcase's per-part budget and HTML-string
// check exempt only that chunk). Add a scenario here when its folder gets a react app.
import { mount as ticker } from "./ticker/react.ts"

export const scenarios = { ticker }
