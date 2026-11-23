// Showcase stage for Debugger: a small program in a CodeEditor with line numbers (click a number: a breakpoint) and
// the Debugger beside it. The program below is written with the calls the instrumenter (march-app-ui, instrument.js)
// writes in, so the stage needs no compiler: Start runs it, the breakpoint on line 4 stops in the loop, Continue goes
// to the next round, the watch `sum * 2` follows.
import { Debugger, createDebugSession, type DebugMeta, type DebuggerSection, CodeEditor } from "march/composite";
import { star, sparkles } from "march/icons";

export const code = `const session = createDebugSession({ persist: "my-debugger" })
<CodeEditor lineNumbers value={source} lineMarks={() => session.breakpoints().map((b) => ({ line: b.line, kind: b.condition ? "conditional" : "breakpoint" }))}
  activeLine={() => session.litLine("cart.js")} onGutter={(line) => session.toggleBreakpoint("cart.js", line)} />
<Debugger session={session} onStart={() => { session.begin(metas); run() }} />`

const FILE = "cart.js"
const SOURCE = `function total(items) {
  let sum = 0
  for (const it of items) {
    sum += it.price * it.qty
  }
  return sum
}
const cart = [{ name: "Kalem", price: 12, qty: 2 }, { name: "Defter", price: 30, qty: 1 }]
const result = total(cart)
console.log("toplam", result)
`
const META: DebugMeta = { file: FILE, module: ["total", "cart", "result"], fns: [["total", 1]], steps: [
  [8, 1, -1, "", [], []], [9, 1, -1, "", [], []], [2, 3, 0, "", ["sum", "items"], []], [3, 3, 0, "", ["sum", "items"], []],
  [4, 5, 0, "", ["it", "sum", "items"], []], [6, 3, 0, "", ["sum", "items"], []], [10, 1, -1, "", [], []],
] }
type Hooks = { s(f: number, s: number, g: () => (() => unknown)[]): void; e(f: number, n: number): number; x(at: number): void; t(e: unknown, at: number): unknown }
/** The program above with the instrumenter's calls (what instrument.js writes for it). */
function run(): void {
  const d = (globalThis as unknown as { __marchDebug: Hooks }).__marchDebug
  function total(items: { price: number; qty: number }[]): number {
    const f = d.e(0, 0)
    try {
      d.s(0, 2, () => [() => sum, () => items, () => total, () => cart, () => result]); let sum = 0
      d.s(0, 3, () => [() => sum, () => items, () => total, () => cart, () => result])
      for (const it of items) { d.s(0, 4, () => [() => it, () => sum, () => items, () => total, () => cart, () => result]); sum += it.price * it.qty }
      d.s(0, 5, () => [() => sum, () => items, () => total, () => cart, () => result]); return sum
    } catch (e) { throw d.t(e, f) } finally { d.x(f) }
  }
  d.s(0, 0, () => [() => total, () => cart, () => result]); const cart = [{ name: "Kalem", price: 12, qty: 2 }, { name: "Defter", price: 30, qty: 1 }]
  d.s(0, 1, () => [() => total, () => cart, () => result]); const result = total(cart)
  d.s(0, 6, () => [() => total, () => cart, () => result]); console.log("toplam", result)
}

const session = createDebugSession({ persist: "sc.debugger.demo" })
if (!session.breakpoints().length) session.setBreakpoint(FILE, 4)
if (!session.watches().length) session.addWatch("sum * 2")
const OWN = { title: "Böcek avı", resume: "Sürdür", over: "Atla", into: "Gir", out: "Çık", back: "Geri sar", stop: "Bitir", start: "Koş", restart: "Baştan koş", watch: "Gözlem", scope: "Değişkenler", stack: "Yığın", breakpoints: "Duraklar", output: "Günlük" }

export default function DebuggerDemo(props: { values: { watch: boolean; scope: boolean; stack: boolean; breakpoints: boolean; output: boolean; timeline: boolean; options: boolean; depth: number; side: boolean; outputLines: number; ownLabels: boolean; ownIcons: boolean } }) {
  const v = props.values
  const sections = (): DebuggerSection[] => [v.watch && "watch", v.scope && "scope", v.stack && "stack", v.breakpoints && "breakpoints", v.output && "output"].filter((k): k is DebuggerSection => !!k)
  return <div class="sc-dbg-demo">
    <CodeEditor class="sc-dbg-code" lineNumbers value={SOURCE} readonly copy={false} message={false} label="cart.js"
      lineMarks={() => session.breakpoints().map((b) => ({ line: b.line, kind: !b.enabled ? "off" : b.log ? "log" : b.condition ? "conditional" : "breakpoint" }))}
      activeLine={() => session.litLine(FILE)} onGutter={(line: number) => session.toggleBreakpoint(FILE, line)} />
    {() => {
      const labels = v.ownLabels ? OWN : undefined, icons = v.ownIcons ? { start: sparkles, resume: star } : undefined, depth = v.depth
      const layout = v.side ? undefined : (["watch", "scope", "breakpoints", "stack", "output"] as DebuggerSection[]), outputLines = v.outputLines
      return <Debugger class="sc-dbg-panel" session={session} sections={sections} timeline={() => v.timeline} options={() => v.options} depth={depth} layout={layout} outputLines={outputLines}
        labels={labels} icons={icons} onStart={() => { session.begin([META]); run() }} />
    }}
  </div>
}
