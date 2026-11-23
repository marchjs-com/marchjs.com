// The shape of an API example file (examples/showcase/src/api-examples/<group>.tsx; layout: tools/api-examples.js).
import type { PlaygroundSpec } from "../catalog/spec.ts";

/** One export's example: the code shown, the live result and, optionally, Playground options for it. */
export interface ApiExample<V = Record<string, unknown>> {
  /** Short, complete usage code (shown with highlighting and a Copy button). */
  code: string;
  /** The live result: a small working demo of the same code. Reads `values` when `play` is given. */
  run: (props: { values: V }) => unknown;
  /** Playground options (only options with an effect; same rules as a component folder's playground.ts). */
  play?: PlaygroundSpec<V>;
}
/** { subpath: { export name: example } }. */
export type ApiExamples = Record<string, Record<string, ApiExample<any>>>;
/** A generated example module (api-examples/gen/<group>/<subpath>--<name>.tsx, tools/api-examples.js): one example. */
export interface ApiExampleModule { default: ApiExample<any> }
/** Typed helper for an example file's default export. */
export const examples = (e: ApiExamples): ApiExamples => e;
