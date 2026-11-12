// Showcase › Motion pages: one block per animation = Demo (preview + Code tab) holding a Playground (stage + options),
// a replay button and the live call line (what the current options would write). Changing an option replays.
import { effect, untrack } from "hadi-march";
import { Button } from "hadi-march/ui";
import { refresh } from "hadi-march/icons";
import { Demo } from "./demo.tsx";
import { Playground, type PlayOption } from "./playground.tsx";

export interface MotionDemoProps {
  title: string;
  desc: string;
  code: string;
  options: readonly PlayOption[];
  /** The call the current options make (shown under the stage). */
  call: () => string;
  /** Plays the animation; runs again whenever an option changes (it reads them). */
  play?: () => void;
  wide?: boolean;
  children?: unknown;
}

export function MotionDemo(props: MotionDemoProps) {
  // first run after mount (refs are set), then on every option change
  if (props.play) effect(() => { for (const o of props.options) o.get(); queueMicrotask(() => untrack(() => props.play!())) })
  return <Demo wide={props.wide} title={props.title} desc={props.desc} code={props.code}>
    <Playground options={props.options}>
      <div class="sc-mo-stage">{props.children}</div>
      <div class="sc-mo-foot">
        <code class="sc-mo-call">{props.call}</code>
        {props.play ? <Button size="sm" variant="ghost" icon={refresh} on:click={() => props.play!()}>Tekrar oynat</Button> : null}
      </div>
    </Playground>
  </Demo>
}

/** A Playground option over a getter / setter pair. */
export function opt<T>(label: string, get: () => T, set: (v: T) => void, more: Omit<PlayOption, "label" | "get" | "set"> = {}): PlayOption {
  return { label, get, set: set as (v: never) => void, ...more }
}

/** Easing choices shared by the motion pages. */
export const EASES = [
  { value: "in-out", label: "yumuşak" },
  { value: "spring", label: "yay" },
  { value: "back", label: "geri" },
  { value: "bounce", label: "sekme" },
  { value: "linear", label: "doğrusal" },
] as const
