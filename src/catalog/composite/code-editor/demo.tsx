// Showcase stage for CodeEditor: a <Button> tag you edit by hand. The foot line says what was read from it; the
// button under the editor follows the valid part (variant, size, the text).
import { CodeEditor, jsxCompleter, type CodeMark } from "march/composite";
import { Button } from "march/actions";
import { toast } from "march/overlays";
import type { ColorToken } from "march/theme";

export const code = `<CodeEditor bind:value={$code} lang="tsx" message={$note} status={$bad ? "error" : "ok"}
  complete={jsxCompleter({ tag: "Button", props: [
    { name: "variant", hint: "görünüm", values: ["primary", "secondary", "ghost", "danger"] },
    { name: "size", hint: "boy", values: ["sm", "md", "lg"] },
    { name: "disabled", hint: "devre dışı" },
  ] })}
  marks={[{ from: 8, to: 23, kind: "flash" }]} />`

const VARIANTS = ["primary", "secondary", "ghost", "danger"], SIZES = ["sm", "md", "lg"]
const PROPS = [
  { name: "variant", hint: "görünüm", values: VARIANTS },
  { name: "size", hint: "boy", values: SIZES },
  { name: "disabled", hint: "devre dışı" },
  { name: "title", hint: "ipucu yazısı", value: '=""' },
]

type Values = {
  lineNumbers: boolean; complete: boolean; multiline: boolean; message: boolean; keys: boolean; shortcuts: boolean; tabSize: number; copy: boolean; flash: boolean; color: string; readonly: boolean; disabled: boolean;
  palette: string; bracketColors: boolean; matchBrackets: boolean; guides: boolean; currentLine: boolean; occurrences: boolean; autoClose: boolean; pasteIndent: boolean; find: boolean; fontSize: number; lineHeight: number;
}

export default function CodeEditorDemo(props: { values: Values }) {
  // a few lines with nested brackets: the guides, the bracket colours and the caret's line show at once
  let $code = `<Button variant="ghost" size="lg" title={["Kaydet", "Gönder"][0]}>
  Kaydet
</Button>`
  let $marks: CodeMark[] = []
  // what the code says, read with two small patterns (the editor itself never runs the code)
  const read = (name: string, list: readonly string[], def: string): { value: string; bad: string } => {
    const m = new RegExp(`\\b${name}="([^"]*)"`).exec($code)
    return !m ? { value: def, bad: "" } : list.includes(m[1]!) ? { value: m[1]!, bad: "" } : { value: def, bad: `${name}: "${m[1]!}" yok → ${list.join(", ")}` }
  }
  const variant = () => read("variant", VARIANTS, "primary"), size = () => read("size", SIZES, "md")
  const text = () => />([^<]*)</.exec($code)?.[1]?.trim() || "Kaydet"
  const bad = () => variant().bad || size().bad
  const note = () => bad() || "Kod okundu: düğme ona uydu."
  // lineNumbers: a click on a number marks the line (a breakpoint's dot), again: unmarks it
  let $pins = new Set<number>()
  const change = (next: string): void => {
    // the part that changed lights up once
    const old = $code
    let a = 0
    while (a < next.length && next[a] === old[a]) a++
    let b = next.length
    while (b > a && next[b - 1] === old[b - 1 - (next.length - old.length)]) b--
    $code = next
    $marks = props.values.flash && b > a ? [{ from: a, to: b, kind: "flash" }] : []
  }
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const color: ColorToken | undefined = v.color ? v.color as ColorToken : undefined
      return <CodeEditor value={$code} onChange={change} lang="tsx" multiline={v.multiline} copy={v.copy} flash={v.flash ? "glow" : "none"}
        m:color={color} readonly={v.readonly} disabled={v.disabled}
        complete={v.complete ? jsxCompleter({ tag: "Button", props: PROPS }) : undefined}
        keys={v.keys ? (v.find ? undefined : { find: false, replace: false, goToLine: false }) : false} tabSize={v.tabSize}
        palette={v.palette === "theme" ? "theme" : "ide"} bracketColors={v.bracketColors} matchBrackets={v.matchBrackets} guides={v.guides}
        currentLine={v.currentLine} occurrences={v.occurrences} autoClose={v.autoClose} pasteIndent={v.pasteIndent}
        fontSize={v.fontSize || undefined} lineHeight={v.lineHeight} shortcuts={v.shortcuts} onSave={() => toast("Kaydedildi (Ctrl+S)")}
        message={v.message ? note : false} status={() => (bad() ? "error" : "ok")}
        marks={() => $marks} label="Button kodu"
        lineNumbers={v.lineNumbers} lineMarks={() => [...$pins].map((line) => ({ line, kind: "breakpoint", title: `${line}. satır işaretli` }))}
        onGutter={(line: number) => { const next = new Set($pins); if (next.has(line)) next.delete(line); else next.add(line); $pins = next }} />
    }}
    <div class="sc-row">
      <Button variant={() => variant().value as "primary"} size={() => size().value as "md"} disabled={() => /\sdisabled\b/.test($code)}>{text}</Button>
      <span class="m-muted">Dene: ( ya da " yaz (kendiliğinden kapanır), Ctrl + F ile ara, Ctrl + = ile büyüt, Ctrl + Boşluk: öneriler.</span>
    </div>
  </div>
}
