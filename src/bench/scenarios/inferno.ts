// The Inferno apps of the realistic scenarios, bundled into the Inferno benchmark chunk (../apps/inferno.jsx re-exports
// this): one chunk holds the library runtime and every app that uses it. Compiled with babel-plugin-inferno
// (tools/gen-bench.mjs → <scenario>/inferno.gen.js).
import { mount as ticker } from "./ticker/inferno.gen.js"
import { mount as tree } from "./tree/inferno.gen.js"
import { mount as derived } from "./derived/inferno.gen.js"
import { mount as theme } from "./theme/inferno.gen.js"
import { mount as hover } from "./hover/inferno.gen.js"
import { mount as counters } from "./counters/inferno.gen.js"
import { mount as store } from "./store/inferno.gen.js"
import { mount as deep } from "./deep/inferno.gen.js"
import { mount as grid } from "./grid/inferno.gen.js"
import { mount as startup } from "./startup/inferno.gen.js"

export const scenarios = { ticker, tree, derived, theme, hover, counters, store, deep, grid, startup }
