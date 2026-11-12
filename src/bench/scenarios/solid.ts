// The SolidJS apps of the realistic scenarios, bundled into the Solid benchmark chunk (../apps/solid.jsx re-exports
// this): one chunk holds the library runtime and every app that uses it. Add a scenario when its folder gets solid.jsx.
import { mount as ticker } from "./ticker/solid.gen.js"
import { mount as tree } from "./tree/solid.gen.js"
import { mount as derived } from "./derived/solid.gen.js"

export const scenarios = { ticker, tree, derived }
