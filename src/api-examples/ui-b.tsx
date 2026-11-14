// API examples of hadi-march/ui, names "Dialog" … "EMOJI_SET" (code-point order; the neighbouring ranges: ui-b*.tsx).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`; components have Playground options.
import { signal } from "hadi-march";
import {
  Dialog, Disclosure, Divider, DockLayout, Drawer, Dropdown, EASING_PRESETS, EMOJI_SET, KeyValue, Button, Segmented, TextInput, type DockApi,
} from "hadi-march/ui";
import { folder, fileText } from "hadi-march/icons";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { useLog } from "./_ui-b.tsx";
import "./ui-b.css";
export { default as SIG } from "./ui-b.sig.gen.ts";

export default examples({
  "hadi-march/ui": {
    Dialog: {
      code: `const open = signal(false)
<Button onClick={() => open.set(true)}>Aç</Button>
<Dialog open={open} onClose={() => open.set(false)} title="Projeyi sil" size="sm"
  footer={<Button variant="danger" onClick={remove}>Sil</Button>}>Bu işlem geri alınamaz.</Dialog>`,
      play: { options: [{ key: "size", label: "Boyut", default: "sm", options: ["sm", "md", "lg"] }, { key: "dismissable", label: "Esc ve perde kapatır", default: true }] },
      run: (p: { values: { size: "sm" | "md" | "lg"; dismissable: boolean } }) => {
        const open = signal(false), log = useLog()
        const close = (why: string) => { open.set(false); log.push(why) }
        return <div class="sc-ex-stack">
          <Row><Button variant="primary" onClick={() => open.set(true)}>Projeyi sil…</Button></Row>
          {() => { const d = p.values.dismissable; return <Dialog open={open} onClose={() => close("kapatıldı")} title="HADİ projesini sil" size={() => p.values.size} dismissable={d}
            footer={<Row><Button variant="ghost" onClick={() => close("vazgeçildi")}>Vazgeç</Button><Button variant="danger" onClick={() => close("silindi")}>Sil</Button></Row>}>
            <p>Proje ve 12 dosyası kalıcı olarak silinir.</p>
            {!d && <p class="m-muted">Bu pencere yalnız düğmelerle kapanır.</p>}
          </Dialog> }}
          <Log lines={log.lines} />
        </div>
      },
    },
    Disclosure: {
      code: `<Disclosure title="Gelişmiş ayarlar" onToggle={(open) => save({ advanced: open })}>
  <Toggle label="Önbelleği kapat" />
</Disclosure>`,
      play: { options: [{ key: "open", label: "Açık başlasın", default: false }] },
      run: (p: { values: { open: boolean } }) => {
        const log = useLog()
        return <div class="sc-ex-stack">
          {() => <Disclosure title="Teslimat ayrıntıları" open={p.values.open} onToggle={(o) => log.push(o ? "açıldı" : "kapandı")}>
            <KeyValue items={{ "Kargo": "HADİ Lojistik", "Süre": "2 iş günü", "Ücret": "Ücretsiz" }} />
          </Disclosure>}
          <Log lines={log.lines} />
        </div>
      },
    },
    Divider: {
      code: `<Divider />
<Divider label="ya da" />
<Row>Kaydet <Divider vertical /> Paylaş</Row>`,
      play: { options: [{ key: "kind", label: "Biçim", default: "label", options: [{ value: "plain", label: "çizgi" }, { value: "label", label: "etiketli" }, { value: "vertical", label: "dikey" }] }] },
      run: (p: { values: { kind: string } }) => {
        const or = signal("ya da")
        return <div class="sc-ex-stack">
          {() => p.values.kind === "vertical"
            ? <Row><Button variant="ghost">Kaydet</Button><Divider vertical /><Button variant="ghost">Paylaş</Button><Divider vertical /><Button variant="ghost">Sil</Button></Row>
            : <div class="sc-ex-stack"><Button variant="primary">E-postayla giriş</Button>{p.values.kind === "label" ? <Divider label={or} /> : <Divider />}<Button>HADİ hesabıyla giriş</Button></div>}
          {() => p.values.kind === "label" && <Row><TextInput value={or} aria-label="Ayırıcı etiketi" /></Row>}
        </div>
      },
    },
    DockLayout: {
      code: `<DockLayout label="Çalışma alanı" layout={{ row: [["files"], ["editor", "log"]], share: .3 }} panels={[
  { id: "files", title: "Dosyalar", icon: folder, content: () => <FileTree /> },
  { id: "editor", title: "app.ts", content: () => <Editor />, dirty: () => $dirty },
  { id: "log", title: "Günlük", content: () => <Log />, badge: () => $errors },
]} api={(a) => dock = a} />`,
      play: { options: [{ key: "split", label: "Bölme", default: "row", options: [{ value: "row", label: "yan yana" }, { value: "column", label: "alt alta" }] }] },
      run: (p: { values: { split: "row" | "column" } }) => {
        const dirty = signal(false), errors = signal(0)
        let dock: DockApi | undefined
        const pane = (text: string) => <div class="sc-ex-ui-b-pane"><p>{text}</p></div>
        const panels = [
          { id: "files", title: "Dosyalar", icon: folder, content: () => pane("src/app.ts · README.md") },
          { id: "editor", title: "app.ts", icon: fileText, content: () => <div class="sc-ex-ui-b-pane"><Button size="sm" onClick={() => dirty.update((d) => !d)}>{() => (dirty() ? "Kaydet" : "Değiştir")}</Button></div>, dirty: dirty },
          { id: "log", title: "Günlük", content: () => <div class="sc-ex-ui-b-pane"><Button size="sm" onClick={() => errors.update((n) => n + 1)}>Hata ekle</Button></div>, badge: () => errors() || null },
        ]
        return <div class="sc-ex-stack">
          <Row><Button size="sm" onClick={() => dock?.open("log")}>Günlüğe geç</Button><Button size="sm" variant="ghost" onClick={() => dock?.reset()}>Yerleşimi sıfırla</Button></Row>
          <div class="sc-ex-ui-b-dock">{() => {
            const s = p.values.split
            return <DockLayout panels={panels} label="HADİ çalışma alanı" commands={false}
              layout={s === "row" ? { row: [["files"], ["editor", "log"]], share: 0.32 } : { column: [["editor", "log"], ["files"]], share: 0.6 }} api={(a: DockApi) => (dock = a)} />
          }}</div>
        </div>
      },
    },
    Drawer: {
      code: `<Drawer open={open} onClose={() => open.set(false)} side="end" title="Filtreler"
  footer={<Button variant="primary" onClick={apply}>Uygula</Button>}>
  <CheckboxGroup bind:value={$tags} options={tags} />
</Drawer>`,
      play: { options: [{ key: "side", label: "Kenar", default: "end", options: [{ value: "start", label: "başlangıç" }, { value: "end", label: "bitiş" }, { value: "bottom", label: "alt" }] }, { key: "size", label: "Boyut", default: "sm", options: ["sm", "md", "lg"] }] },
      run: (p: { values: { side: "start" | "end" | "bottom"; size: "sm" | "md" | "lg" } }) => {
        const open = signal(false), sort = signal("new"), applied = signal("en yeni")
        const labels: Record<string, string> = { new: "en yeni", cheap: "en ucuz", top: "en çok satan" }
        return <Row>
          <Button onClick={() => open.set(true)}>Sırala…</Button><Out label="Sıralama" value={applied} />
          <Drawer open={open} onClose={() => open.set(false)} side={() => p.values.side} size={() => p.values.size} title="Sıralama"
            footer={<Button variant="primary" onClick={() => { applied.set(labels[sort()]!); open.set(false) }}>Uygula</Button>}>
            <Segmented value={sort} aria-label="Sıralama" options={Object.entries(labels).map(([value, label]) => ({ value, label }))} />
          </Drawer>
        </Row>
      },
    },
    Dropdown: {
      code: `<Dropdown label="Filtre" icon={filter}>
  {(close) => <Stack><Checkbox label="Yalnız açık" bind:checked={$open} /><Button onClick={close}>Tamam</Button></Stack>}
</Dropdown>`,
      play: { options: [{ key: "placement", label: "Yerleşim", default: "bottom-start", options: [{ value: "bottom-start", label: "alt" }, { value: "top-start", label: "üst" }] }, { key: "variant", label: "Görünüm", default: "secondary", options: [{ value: "secondary", label: "ikincil" }, { value: "ghost", label: "hayalet" }, { value: "primary", label: "birincil" }] }] },
      run: (p: { values: { placement: "bottom-start" | "top-start"; variant: "secondary" | "ghost" | "primary" } }) => {
        const pick = signal(3), chosen = signal(3)
        return <Row>
          {() => { const pl = p.values.placement; return <Dropdown label="Puan filtresi" variant={() => p.values.variant} placement={pl}>
            {(close: () => void) => <div class="sc-stack sc-ex-ui-b-pop">
              <Segmented value={pick} aria-label="En az puan" options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n}★` }))} />
              <Row><Button size="sm" variant="ghost" onClick={() => close()}>Vazgeç</Button><Button size="sm" variant="primary" onClick={() => { chosen.set(pick()); close() }}>Uygula</Button></Row>
            </div>}
          </Dropdown> }}
          <Out label="En az" value={() => `${chosen()}★`} />
        </Row>
      },
    },
    EASING_PRESETS: {
      code: `EASING_PRESETS.map((p) => p.name)          // ["linear", "ease", "in", "out", …]
EASING_PRESETS.find((p) => p.name === "back")!.value   // [0.34, 1.56, 0.64, 1]`,
      run: () => {
        const i = signal(0)
        const cur = () => EASING_PRESETS[i()]!
        return <div class="sc-ex-stack">
          <Row>{EASING_PRESETS.map((p, n) => <Button size="sm" variant={() => (i() === n ? "primary" : "ghost")} aria-pressed={() => String(i() === n)} onClick={() => i.set(n)}>{p.name}</Button>)}</Row>
          <Out label="value" value={() => `[${cur().value.join(", ")}]`} />
          <Out label="CSS" value={() => `cubic-bezier(${cur().value.join(", ")})`} />
        </div>
      },
    },
    EMOJI_SET: {
      code: `<ReactionPicker layout="grid" onPick={react} />          // uses EMOJI_SET
<ReactionPicker emojis={EMOJI_SET.slice(12, 18)} onPick={react} />`,
      run: () => {
        const from = signal(0), picked = signal("—")
        const page = () => EMOJI_SET.slice(from(), from() + 12)
        return <div class="sc-ex-stack">
          <Row><Button size="sm" variant="ghost" onClick={() => from.update((n) => (n + 12) % EMOJI_SET.length)}>Sonraki 12</Button><Out label="Toplam" value={EMOJI_SET.length} /><Out label="Seçilen" value={picked} /></Row>
          <div class="sc-ex-ui-b-emoji" role="group" aria-label="Emojiler">{() => page().map((e) => <button type="button" aria-label={e} onClick={() => picked.set(e)}>{e}</button>)}</div>
        </div>
      },
    },
  },
})
