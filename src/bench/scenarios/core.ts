// Realistic scenarios (Speed › Comparison › "Gerçekçi senaryolar"): workloads where the update is small and frequent
// and the page is large, the case fine-grained signals are built for. Kept apart from the canonical operations.
// Every library gets the same seeded data and the same precomputed list of steps; each step is one frame: it is called
// at the start of an animation frame and timed until just after that frame's paint (script + style + layout + paint).
// A frame over 16.7 ms is a dropped frame at 60 fps. After the run the DOM is checked against the model.

/** What every scenario app does: apply one step's change, tear down. */
export interface ScenarioApp { step(payload: unknown): void; destroy(): void }
export type ScenarioMount<D = unknown> = (host: HTMLElement, data: D) => ScenarioApp | Promise<ScenarioApp>

export interface Scenario<D = unknown, P = unknown> {
  id: string
  label: string
  /** what it measures, plainly (shown on the page) */
  desc: string
  /** measured steps (frames) and warm-up steps */
  steps: number
  warm: number
  /** the page's data; `large`: the optional large size (see `large` below) */
  data(seed: number, large?: boolean): D
  /** the large size, when the scenario has one (e.g. "10.000 sayaç"); its note says what changes at that size */
  large?: { label: string; note: string }
  /** the step payloads, in order (warm-up first) */
  plan(data: D, seed: number, count: number): P[]
  /** the DOM after `applied` steps matches the model */
  check(host: HTMLElement, data: D, applied: P[]): boolean
}

export const FRAME_MS = 1000 / 60
