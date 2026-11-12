// API examples of hadi-march/ui, names QUICK_REACTIONS … RecordListEditor (code-point order). Layout and rules: tools/api-examples.js.
// Each `run` is a small live demo of its `code`; components re-create themselves for options they read once.
import { signal } from "hadi-march";
import { QUICK_REACTIONS, RadioGroup, Rating, ReactionPicker, RecordListEditor, Button } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./ui-c.css";
export { default as SIG } from "./ui-c5.sig.gen.ts";

/** A log signal and a function that appends a line (keeps the last six). */
const logger = () => { const lines = signal<string[]>([]); return [lines, (l: string) => lines.update((x) => [...x.slice(-5), l])] as const }
const opts = (...pairs: [unknown, string][]) => pairs.map(([value, label]) => ({ value, label }))

export default examples({
  "hadi-march/ui": {
    QUICK_REACTIONS: {
      code: `QUICK_REACTIONS   // ["❤️", "😂", "😮", "😢", "🙏", "👍"]
<ReactionPicker emojis={[...QUICK_REACTIONS, "🎉"]} onPick={react} />`,
      run: () => {
        const counts = signal<Record<string, number>>({})
        return <div class="sc-ex-ui-c-stack">
          <Row>{QUICK_REACTIONS.map((e) => <Button variant="ghost" aria-label={`${e} tepkisi`} onClick={() => counts.update((c) => ({ ...c, [e]: (c[e] ?? 0) + 1 }))}>
            <span class="sc-ex-ui-c-emoji">{e}</span> {() => counts()[e] ?? 0}</Button>)}</Row>
          <Out label="toplam" value={() => Object.values(counts()).reduce((a, b) => a + b, 0)} />
        </div>
      },
    },
    RadioGroup: {
      code: `<RadioGroup value={plan} options={[
  { value: "free", label: "Ücretsiz" }, { value: "pro", label: "Pro", hint: "Aylık 99 ₺" },
]} variant="card" />`,
      play: { options: [
        { key: "variant", label: "Görünüm", default: "card", options: opts(["classic", "klasik"], ["card", "kart"], ["chip", "çip"]) },
        { key: "inline", label: "Yan yana", default: true },
      ] },
      run: (p: { values: { variant: "classic" | "card" | "chip"; inline: boolean } }) => {
        const plan = signal<unknown>("pro")
        return <div class="sc-ex-ui-c-stack">
          {() => { const variant = p.values.variant, inline = p.values.inline
            return <RadioGroup value={plan} variant={variant} inline={inline} aria-label="Plan" options={[
              { value: "free", label: "Ücretsiz", hint: "3 proje" }, { value: "pro", label: "Pro", hint: "Aylık 99 ₺" }, { value: "team", label: "Ekip", hint: "Kişi başı 79 ₺" },
            ]} /> }}
          <Out label="plan" value={() => String(plan())} />
        </div>
      },
    },
    Rating: {
      code: `<Rating value={score()} setValue={score.set} max={5} label="Ürün puanı" />`,
      play: { options: [
        { key: "max", label: "Yıldız", default: 5, options: [5, 10] },
        { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
        { key: "readonly", label: "Salt okunur", default: false },
      ] },
      run: (p: { values: { max: number; size: "sm" | "md" | "lg"; readonly: boolean } }) => {
        const score = signal(3)
        return <div class="sc-ex-ui-c-stack">
          {() => { const max = p.values.max, size = p.values.size, readonly = p.values.readonly
            return <Rating value={score} setValue={(v) => score.set(v)} max={max} size={size} readonly={readonly} label="Ürün puanı" /> }}
          <Row><Out label="puan" value={() => `${score()} / ${p.values.max}`} /><Button variant="ghost" onClick={() => score.set(0)}>Temizle</Button></Row>
        </div>
      },
    },
    ReactionPicker: {
      code: `<ReactionPicker selected={myReaction()} onPick={(e) => react(post.id, e)} onMore={openEmojiPanel} />`,
      play: { options: [
        { key: "layout", label: "Düzen", default: "row", options: opts(["row", "satır"], ["grid", "ızgara"]) },
        { key: "more", label: "+ düğmesi", default: true, visibleWhen: (v: { layout: string }) => v.layout === "row" },
      ] },
      run: (p: { values: { layout: "row" | "grid"; more: boolean } }) => {
        const mine = signal<string | null>(null)
        const [lines, add] = logger()
        return <div class="sc-ex-ui-c-stack">
          {() => { const layout = p.values.layout, more = p.values.more
            return <ReactionPicker layout={layout} selected={mine} label="Tepki ver"
              onPick={(e) => { mine.set(mine() === e ? null : e); add(`tepki: ${e}`) }} onMore={more && layout === "row" ? () => add("daha fazla emoji") : undefined} /> }}
          <Row><Out label="tepkim" value={() => mine() ?? "—"} /></Row>
          <Log lines={lines} />
        </div>
      },
    },
    RecordListEditor: {
      code: `<RecordListEditor value={items} fields={{
  name: { type: "text", label: "Ürün", required: true },
  qty: { type: "int", label: "Adet", min: 1 },
}} blank={{ name: "", qty: 1 }} addLabel="Satır ekle" max={5} />`,
      play: { options: [
        { key: "sortable", label: "Sıralanabilir", default: true },
        { key: "removable", label: "Silinebilir", default: true },
      ] },
      run: (p: { values: { sortable: boolean; removable: boolean } }) => {
        const rows = signal<Record<string, unknown>[]>([{ name: "Defter", qty: 2 }, { name: "Kalem", qty: 10 }])
        return <div class="sc-ex-ui-c-stack">
          {() => { const sortable = p.values.sortable, removable = p.values.removable
            return <RecordListEditor value={rows} sortable={sortable} removable={removable} max={5} addLabel="Satır ekle" blank={{ name: "", qty: 1 }}
              fields={{ name: { type: "text", label: "Ürün", required: true }, qty: { type: "int", label: "Adet", min: 1 } }} /> }}
          <Row><Out label="satır" value={() => rows().length} /><Out label="toplam adet" value={() => rows().reduce((s, r) => s + (Number(r.qty) || 0), 0)} /></Row>
        </div>
      },
    },
  },
})
