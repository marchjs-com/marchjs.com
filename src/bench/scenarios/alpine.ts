// The Alpine.js apps of the realistic scenarios, bundled into the Alpine benchmark chunk (../apps/alpine.ts re-exports
// this): one chunk holds the library runtime and every app that uses it.
import { mount as ticker } from "./ticker/alpine.ts"
import { mount as tree } from "./tree/alpine.ts"
import { mount as derived } from "./derived/alpine.ts"
import { mount as theme } from "./theme/alpine.ts"
import { mount as hover } from "./hover/alpine.ts"
import { mount as counters } from "./counters/alpine.ts"
import { mount as store } from "./store/alpine.ts"
import { mount as deep } from "./deep/alpine.ts"
import { mount as grid } from "./grid/alpine.ts"
import { mount as startup } from "./startup/alpine.ts"

export const scenarios = { ticker, tree, derived, theme, hover, counters, store, deep, grid, startup }
