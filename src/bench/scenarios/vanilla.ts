// The plain-DOM apps of the realistic scenarios (one chunk). Add a scenario when its folder gets vanilla.ts.
import { mount as ticker } from "./ticker/vanilla.ts"
import { mount as tree } from "./tree/vanilla.ts"

export const scenarios = { ticker, tree }
