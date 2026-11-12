// The vue apps of the realistic scenarios, bundled into the vue benchmark chunk (../apps/vue.ts re-exports this):
// one chunk holds the library runtime and every app that uses it (the showcase's per-part budget and HTML-string
// check exempt only that chunk). Add a scenario here when its folder gets a vue app.
import { mount as ticker } from "./ticker/vue.ts"

export const scenarios = { ticker }
