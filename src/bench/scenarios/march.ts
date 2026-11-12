// The HADI March apps of the realistic scenarios (one chunk). Add a scenario when its folder gets march.tsx.
import { mount as ticker } from "./ticker/march.tsx"
import { mount as tree } from "./tree/march.tsx"
import { mount as derived } from "./derived/march.tsx"
import { mount as theme } from "./theme/march.tsx"
import { mount as hover } from "./hover/march.tsx"
import { mount as counters } from "./counters/march.tsx"

export const scenarios = { ticker, tree, derived, theme, hover, counters }
