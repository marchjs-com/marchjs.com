// The Angular apps of the realistic scenarios, compiled ahead of time together with the benchmark app
// (../apps/angular-app.ts re-exports this; tools/gen-bench.mjs → ../apps/angular.gen.js): one chunk holds the
// framework and every app that uses it.
import { mount as ticker } from "./ticker/angular.ts"
import { mount as tree } from "./tree/angular.ts"
import { mount as derived } from "./derived/angular.ts"
import { mount as theme } from "./theme/angular.ts"
import { mount as hover } from "./hover/angular.ts"
import { mount as counters } from "./counters/angular.ts"
import { mount as store } from "./store/angular.ts"
import { mount as deep } from "./deep/angular.ts"
import { mount as grid } from "./grid/angular.ts"
import { mount as startup } from "./startup/angular.ts"

export const scenarios = { ticker, tree, derived, theme, hover, counters, store, deep, grid, startup }
