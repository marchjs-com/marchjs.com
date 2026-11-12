// API examples of hadi-march/ui, names RichTextEditor … SearchBox (code-point order). Layout and rules: tools/api-examples.js.
// Each `run` is a small live demo of its `code`; components re-create themselves for options they read once.
import { signal } from "hadi-march";
import { RichTextEditor, SearchBox } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./ui-c.css";
export { default as SIG } from "./ui-c6.sig.gen.ts";

const CITIES = ["Ankara", "Antalya", "Bursa", "Eskişehir", "İstanbul", "İzmir", "Konya", "Trabzon"]
/** A log signal and a function that appends a line (keeps the last six). */
const logger = () => { const lines = signal<string[]>([]); return [lines, (l: string) => lines.update((x) => [...x.slice(-5), l])] as const }
const opts = (...pairs: [unknown, string][]) => pairs.map(([value, label]) => ({ value, label }))

export default examples({
  "hadi-march/ui": {
    RichTextEditor: {
      code: `<RichTextEditor value={body} placeholder="Bir şeyler yazın… (@ bahset, : emoji)"
  mentions={[{ id: "ada", label: "Ada" }]} toolbar={["bold", "italic", "link", "|", "ul"]} />`,
      play: { options: [
        { key: "toolbar", label: "Araç çubuğu", default: "minimal", options: opts(["full", "tam"], ["minimal", "sade"], ["none", "yok"]) },
        { key: "counter", label: "Sayaç", default: true },
      ] },
      run: (p: { values: { toolbar: string; counter: boolean } }) => {
        const body = signal("**Acme** ekibine merhaba! Yarınki toplantı 10.00'da.")
        const tools = { full: true, minimal: ["bold", "italic", "link", "|", "ul"], none: false } as const
        return <div class="sc-ex-ui-c-stack">
          {() => { const toolbar = tools[p.values.toolbar as keyof typeof tools], counter = p.values.counter
            return <RichTextEditor value={body} toolbar={toolbar} counter={counter} rows={3} placeholder="Bir şeyler yazın… (@ bahset, : emoji)"
              mentions={[{ id: "ada", label: "Ada", hint: "Tasarım" }, { id: "deniz", label: "Deniz", hint: "Ürün" }]} /> }}
          <Out label="Markdown" value={body} />
        </div>
      },
    },
    SearchBox: {
      code: `<SearchBox value={q} onSearch={(text) => load({ q: text })} shortcut placeholder="Ara (/)" />`,
      play: { options: [{ key: "debounce", label: "Bekleme", default: 250, options: opts([0, "yok"], [250, "250 ms"], [800, "800 ms"]) }] },
      run: (p: { values: { debounce: number } }) => {
        const q = signal("")
        const searched = signal("")
        const [lines, add] = logger()
        const hits = () => CITIES.filter((c) => c.toLocaleLowerCase("tr").includes(searched().toLocaleLowerCase("tr")))
        return <div class="sc-ex-ui-c-stack">
          {() => { const debounce = p.values.debounce
            return <div class="sc-ex-ui-c-narrow"><SearchBox value={q} debounce={debounce} placeholder="Şehir ara" label="Şehir ara"
              onSearch={(text) => { searched.set(text); add(`arama: "${text}"`) }} onEnter={(text) => add(`Enter: "${text}"`)} /></div> }}
          <Row><Out label="yazılan" value={() => q() || "—"} /><Out label="sonuç" value={() => hits().join(", ") || "yok"} /></Row>
          <Log lines={lines} />
        </div>
      },
    },
  },
})
