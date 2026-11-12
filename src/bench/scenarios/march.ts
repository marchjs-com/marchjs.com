// The HADI March apps of the realistic scenarios (one chunk). Add a scenario when its folder gets march.tsx.
import { mount as ticker } from "./ticker/march.tsx"
import { mount as tree } from "./tree/march.tsx"
import { mount as derived } from "./derived/march.tsx"
import { mount as theme } from "./theme/march.tsx"

export const scenarios = { ticker, tree, derived, theme }
