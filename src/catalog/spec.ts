// The Options panel of a component card (each folder's playground.ts): the options, how a value is written in the
// card's code and how edited code is read back. Moved here from March (src/components/meta.ts) with the catalog.

/**
 * How a value is written in the generated code: the attribute value as written (`'"lg"'`, `"{plus}"`, `""` = a bare
 * prop), `null` (the prop is left out), or several props at once (`{ dot: "", dotColor: '"brand-orange"' }`).
 */
export type PlaygroundCodeValue = string | null | Readonly<Record<string, string | null>>;

/** One Playground option. Only options with an effect are listed; `visibleWhen` hides one while it has none. */
export interface PlaygroundOption<V = Record<string, unknown>> {
  key: string;
  /** Shown label (the showcase is Turkish). */
  label: string;
  default: unknown;
  /** Choices (ChoicePicker picks the look); omit for a boolean (switch), give min / max (slider) or kind "text". */
  options?: readonly (string | number | { value: unknown; label: string })[];
  /** "text": a text field (the default is a string). "json": a data prop as JSON text (a required `nodes` / `items`):
   * the field is text, the component gets the parsed value (MarchIDE's raw component); give toCode `(x) => \`{${x}}\``. */
  kind?: "segmented" | "chips" | "cards" | "grid" | "combobox" | "text" | "json";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  visibleWhen?: (values: V) => boolean;
  /**
   * Generated code (PlaygroundSpec.code): the prop this option writes. Default: `key`. "children": the element's
   * text. `false`: not written (an option of the demo, not of the component).
   */
  prop?: string | false;
  /**
   * Generated code: what a value writes: a map from the option value (as a string) or a function. Without it (and
   * for values the map does not list): the default value is left out, `true` is a bare prop, a string is quoted,
   * anything else goes in braces.
   */
  toCode?: Readonly<Record<string, PlaygroundCodeValue>> | ((value: unknown, values: V) => PlaygroundCodeValue);
  /**
   * Edited code → the option's value, from every attribute as written (`""` = bare) and the children; `undefined`:
   * the usual rule (the choice whose toCode equals what is written; a literal for sliders and text).
   */
  fromCode?: (attrs: Readonly<Record<string, string>>, children: string | null) => unknown;
  /**
   * MarchIDE: the value the bare component gets for this option's prop, when the option's value is not the prop
   * itself (a count that becomes `items`, a yes / no that becomes sample children). Wins over toCode there.
   */
  toProp?: (value: unknown, values: V) => unknown;
  /** MarchIDE: several props from this one option (`{ onMore: fn, moreIcon: "icon:smile" }`); wins over toProp. */
  toProps?: (value: unknown, values: V) => Readonly<Record<string, unknown>>;
}

/** The code the showcase writes from the options (and reads back when it is edited). */
export interface PlaygroundCode<V = Record<string, unknown>> {
  /** Tag name (default: the component's name). */
  tag?: string | ((values: V) => string);
  /** Props always written, before the options: `{ post: "{post}" }` (`""` = a bare prop). */
  props?: Readonly<Record<string, string>>;
  /** The children as written (text or JSX); none: self-closing. An option with prop "children" wins. */
  children?: string | ((values: V) => string | null);
  /** The element of the demo that attributes typed into the code (id, class, title, aria-*, m:…) are written on: a
   * selector inside the stage (default: the first element with an `m-` class). */
  root?: string;
}
export interface PlaygroundSpec<V = Record<string, unknown>> {
  options: readonly PlaygroundOption<V>[];
  /** How the showcase stage holds the demo: "fill" (default: the demo takes the stage's width) or "center" (a small
   * component: centred in a framed stage). */
  stage?: "fill" | "center";
  /**
   * The code under the stage, written from the options (each option says how with prop / toCode) and editable. A
   * function: the whole code by hand (read-only). Without it the card shows the first code block of docs.md.
   */
  code?: PlaygroundCode<V> | ((values: V) => string);
}

/** Typed helper for a component folder's playground.ts (the showcase options). */
export const definePlayground = <V = Record<string, unknown>>(p: PlaygroundSpec<V>): PlaygroundSpec<V> => p;
