// Shared helpers of the ui-f API example files (a file starting with "_" is not an example file).
import { effect } from "hadi-march";
import { Segmented, TextInput, schemaAt, sample } from "hadi-march/ui";
import "./ui-f.css";

export type Model = Parameters<typeof sample>[0];
export type Schema = NonNullable<Parameters<typeof schemaAt>[0]>;

export const json = (v: unknown): string => JSON.stringify(v) ?? "undefined"
export const now = () => new Date().toLocaleTimeString("tr-TR")

/** A color preview box; `color` is any CSS color or gradient (set through the style object, never an attribute). */
export function Swatch(props: { color: () => string; wide?: boolean }) {
  return <span class={props.wide ? "sc-ex-ui-f-swatch sc-ex-ui-f-wide" : "sc-ex-ui-f-swatch"} role="img" aria-label="Önizleme"
    ref={(el: HTMLElement) => effect(() => { el.style.background = props.color() })} />
}

/** A text field bound to a signal. */
export const Field = (props: { sig: { (): string; set(v: string): unknown }; label: string }) => <TextInput value={props.sig} aria-label={props.label} />

/** A choice bound to a signal. */
export const Pick = (props: { sig: { (): string; set(v: string): unknown }; options: [string, string][]; label: string }) =>
  <Segmented value={props.sig} aria-label={props.label} options={props.options.map(([value, label]) => ({ value, label }))} />

export const KT: Model = {
  duration: 1000,
  tracks: [
    { id: "a", target: "logo", prop: "x", keys: [{ at: 0, value: 0 }, { at: 1000, value: 120 }] },
    { id: "b", target: "logo", prop: "rotate", keys: [{ at: 0, value: 0 }, { at: 500, value: 90, easing: "out" }, { at: 1000, value: 0 }] },
    { id: "c", target: "logo", prop: "scale", keys: [{ at: 0, value: 1 }, { at: 1000, value: 1.5 }] },
  ],
}

export const DOC = { name: "HADİ", tags: ["a", "b"], owner: { id: 7, mail: "ada@hadisosyal.com" } }
export const SCHEMA: Schema = {
  type: "object", required: ["name", "size"],
  properties: { name: { type: "string", minLength: 3 }, size: { type: "integer", minimum: 1 }, owner: { type: "object", properties: { mail: { type: "string", format: "email" } } } },
}

