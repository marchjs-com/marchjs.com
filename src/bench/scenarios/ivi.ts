// The ivi apps of the realistic scenarios, bundled into the ivi benchmark chunk (../apps/ivi.ts re-exports this): one
// chunk holds the library runtime and every app that uses it. Compiled with ivi's template compiler
// (tools/gen-bench.mjs → <scenario>/ivi.gen.js).
import { mount as ticker } from "./ticker/ivi.gen.js"
import { mount as tree } from "./tree/ivi.gen.js"
import { mount as derived } from "./derived/ivi.gen.js"
import { mount as theme } from "./theme/ivi.gen.js"
import { mount as hover } from "./hover/ivi.gen.js"
import { mount as counters } from "./counters/ivi.gen.js"
import { mount as store } from "./store/ivi.gen.js"
import { mount as deep } from "./deep/ivi.gen.js"
import { mount as grid } from "./grid/ivi.gen.js"
import { mount as startup } from "./startup/ivi.gen.js"

export const scenarios = { ticker, tree, derived, theme, hover, counters, store, deep, grid, startup }
