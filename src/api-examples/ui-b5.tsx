// API examples of hadi-march/ui, names "ImageCropper" … "Kbd" (code-point order; the neighbouring ranges: ui-b*.tsx).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`; components have Playground options.
import { signal } from "hadi-march";
import {
  Field, Button, TextInput, ImageCropper, IntInput, JsonEditor, JsonView, Kanban, Kbd, Loader, type ImageCropperProps, type KanbanColumn,
} from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { useLog } from "./_ui-b.tsx";
import "./ui-b.css";
export { default as SIG } from "./ui-b5.sig.gen.ts";

type Crop = Parameters<NonNullable<ImageCropperProps["onChange"]>>[0]

const token = (name: string): string => globalThis.getComputedStyle?.(globalThis.document.documentElement).getPropertyValue(name).trim() ?? ""

/** A small picture drawn with the theme's colors (a blob: URL, so the cropper can read it back). */
function picture(): Promise<string> {
  const cv = globalThis.document.createElement("canvas")
  cv.width = 640
  cv.height = 400
  const g = cv.getContext("2d")!
  g.fillStyle = token("--hm-brand-blue"); g.fillRect(0, 0, 640, 400)
  g.fillStyle = token("--hm-brand-orange"); g.beginPath(); g.arc(470, 130, 64, 0, Math.PI * 2); g.fill()
  g.fillStyle = token("--hm-brand-green"); g.fillRect(0, 290, 640, 110)
  g.fillStyle = token("--hm-brand-purple"); g.beginPath(); g.moveTo(60, 300); g.lineTo(200, 120); g.lineTo(340, 300); g.closePath(); g.fill()
  return new Promise((res) => cv.toBlob((b) => res(b ? URL.createObjectURL(b) : ""), "image/png"))
}

export default examples({
  "hadi-march/ui": {
    ImageCropper: {
      code: `<ImageCropper src={blobUrl} alt="Profil fotoğrafı" aspect={1} bind:value={$crop}
  api={(a) => cropper = a} />
const blob = await cropper.toBlob({ width: 256 })`,
      play: { options: [{ key: "aspect", label: "Oran", default: "1", options: [{ value: "1", label: "1:1" }, { value: "1.7778", label: "16:9" }, { value: "free", label: "seçenekli" }] }, { key: "preview", label: "Önizleme", default: false }] },
      run: (p: { values: { aspect: string; preview: boolean } }) => {
        const src = signal(""), crop = signal<Crop | null>(null)
        void picture().then((u) => src.set(u))
        return <div class="sc-stack sc-ex-ui-b-crop">
          {() => { const a = p.values.aspect, pv = p.values.preview; return src() ? <ImageCropper src={src()} alt="Dağ ve güneş" aspect={a === "free" ? undefined : Number(a)} preview={pv} onChange={(c: Crop) => crop.set(c)} /> : <Loader text="Görsel hazırlanıyor…" /> }}
          <Out label="Kırpma" value={() => { const c = crop(); return c ? `yakınlık ${c.zoom?.toFixed(2)} · açı ${c.rotate}°` : "—" }} />
        </div>
      },
    },
    IntInput: {
      code: `<Field label="Koltuk"><IntInput bind:value={$seats} min={1} max={500} /></Field>
// NumberInput with 0 decimals: "12,7" → 13`,
      play: { options: [{ key: "grouping", label: "Basamak ayırıcı", default: true }, { key: "max", label: "En çok", default: 500, options: [10, 500, 100000] }] },
      run: (p: { values: { grouping: boolean; max: number } }) => {
        const seats = signal<number | null>(1250)
        return <div class="sc-ex-stack">
          {() => { const g = p.values.grouping, m = p.values.max; return <Field label="Koltuk" help={`1–${m}`}><IntInput value={seats} min={1} max={m} grouping={g} /></Field> }}
          <Row><Button size="sm" onClick={() => seats.update((n) => (n ?? 0) + 1)}>+1</Button><Out label="Değer" value={() => String(seats())} /><Out label="tür" value={() => typeof seats()} /></Row>
        </div>
      },
    },
    JsonEditor: {
      code: `<JsonEditor bind:value={$config} rows={8} modes={["text", "tree"]}
  validate={(v) => (typeof v === "object" && v && "name" in v ? null : '"name" gerekli')} />`,
      play: { options: [{ key: "mode", label: "İlk görünüm", default: "text", options: [{ value: "text", label: "metin" }, { value: "tree", label: "ağaç" }] }, { key: "readonly", label: "Salt okunur", default: false }] },
      run: (p: { values: { mode: "text" | "tree"; readonly: boolean } }) => {
        const config = signal<unknown>({ name: "hadi", port: 8080, flags: ["fast", "safe"] })
        return <div class="sc-ex-stack">
          {() => { const m = p.values.mode, ro = p.values.readonly; return <JsonEditor value={config} mode={m} readonly={ro} rows={7} aria-label="Ayarlar"
            validate={(v: unknown) => (v && typeof v === "object" && "name" in v ? null : '"name" alanı gerekli')} /> }}
          <Out label="port" value={() => String((config() as { port?: unknown } | null)?.port ?? "—")} />
        </div>
      },
    },
    Kbd: {
      code: `<Kbd keys="mod+k" />          // Ctrl+K, or ⌘K on Apple devices
<Kbd>Esc</Kbd>`,
      play: { options: [{ key: "keys", label: "Kısayol", default: "mod+k", options: [{ value: "mod+k", label: "mod+k" }, { value: "shift+alt+f", label: "shift+alt+f" }, { value: "mod+shift+p", label: "mod+shift+p" }] }] },
      run: (p: { values: { keys: string } }) => {
        const custom = signal("ctrl+s")
        return <div class="sc-ex-stack">
          <Row><span>Komut paleti:</span><Kbd keys={() => p.values.keys} /><span>Kapat:</span><Kbd>Esc</Kbd></Row>
          <Row><TextInput value={custom} aria-label="Kısayol yaz" placeholder="ctrl+s" /><Kbd keys={custom} /></Row>
        </div>
      },
    },
  },
})
