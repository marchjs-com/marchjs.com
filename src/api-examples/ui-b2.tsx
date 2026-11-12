// API examples of hadi-march/ui, names "EasingCurveEditor" … "FieldContext" (code-point order; the neighbouring ranges: ui-b*.tsx).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`; components have Playground options.
import { signal, useContext } from "hadi-march";
import {
  EasingCurveEditor, EditForm, EmailInput, Field, Button, Badge, TextInput, Empty, ErrorBox, Feed, FieldContext, type Post,
} from "hadi-march/ui";
import { fileText, Icon, inbox } from "hadi-march/icons";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { wait, useLog, Profile } from "./_ui-b.tsx";
import "./ui-b.css";
export { default as SIG } from "./ui-b2.sig.gen.ts";

const POSTS: Post[] = [
  { id: "p1", author: { name: "Ada Yılmaz", handle: "ada", verified: true }, time: Date.now() - 4 * 60_000, text: "HADİ'nin yeni sürümü yayında: arama iki kat hızlı.", likes: 12, comments: 3 },
  { id: "p2", author: { name: "HADİ Ekibi", handle: "hadisosyal" }, time: Date.now() - 52 * 60_000, place: "İzmir", text: "Cumartesi buluşmasına kayıtlar açıldı.", likes: 41, liked: true, comments: 9, shares: 2 },
]

export default examples({
  "hadi-march/ui": {
    EasingCurveEditor: {
      code: `const curve = signal("out")
<EasingCurveEditor value={curve} preview="scale" duration={600} />
animate(card, frames, { easing: curve() })   // hadi-march/motion: a name or "cubic-bezier(…)"`,
      play: { options: [{ key: "preview", label: "Önizleme", default: "move", options: [{ value: "move", label: "kayma" }, { value: "scale", label: "büyüme" }, { value: "fade", label: "solma" }, { value: "none", label: "yok" }] }, { key: "presets", label: "Hazır eğriler", default: true }] },
      run: (p: { values: { preview: "move" | "scale" | "fade" | "none"; presets: boolean } }) => {
        const curve = signal("back")
        return <div class="sc-ex-stack">
          {() => { const pv = p.values.preview, pr = p.values.presets; return <EasingCurveEditor value={curve} preview={pv} presets={pr ? undefined : false} duration={700} aria-label="Hareket eğrisi" /> }}
          <Out label="Değer" value={curve} />
        </div>
      },
    },
    EditForm: {
      code: `<EditForm schema={Profile} load={() => api.profile()} reason={10}
  save={(values, { changed, reason }) => api.saveProfile(changed, reason)} />`,
      play: { options: [{ key: "layout", label: "Yerleşim", default: "grid", options: [{ value: "stack", label: "alt alta" }, { value: "grid", label: "ızgara" }] }, { key: "readonly", label: "Salt okunur", default: false }] },
      run: (p: { values: { layout: "stack" | "grid"; readonly: boolean } }) => {
        const db: { name: string; email: string; team: string | null } = { name: "Ada", email: "ada@hadisosyal.com", team: "web" }
        const log = useLog()
        return <div class="sc-ex-stack">
          {() => { const l = p.values.layout, ro = p.values.readonly; return <EditForm schema={Profile} layout={l} cols={2} readonly={ro} title="Profil" submitLabel="Kaydet"
            load={async () => { await wait(400); return { ...db } }}
            save={async (v: typeof db, ctx: { changed: Partial<typeof db> }) => { await wait(300); Object.assign(db, v); log.push(`kaydedildi: ${Object.keys(ctx.changed).join(", ") || "değişiklik yok"}`); return v }}
            useResult successMessage={false} /> }}
          <Log lines={log.lines} />
        </div>
      },
    },
    EmailInput: {
      code: `<Field label="E-posta"><EmailInput bind:value={$mail} placeholder="ad@hadisosyal.com" /></Field>
// type="email", autocomplete="email", inputmode="email", the value trimmed`,
      play: { options: [{ key: "disabled", label: "Devre dışı", default: false }] },
      run: (p: { values: { disabled: boolean } }) => {
        const mail = signal("  ada@hadisosyal.com ")
        const ok = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail())
        return <div class="sc-ex-stack">
          {() => { const d = p.values.disabled; return <Field label="E-posta" help="Baştaki ve sondaki boşluklar silinir"><EmailInput value={mail} disabled={d} placeholder="ad@hadisosyal.com" /></Field> }}
          <Row><Out label="Değer" value={() => JSON.stringify(mail())} /><Badge tone={() => (ok() ? "success" : "danger")}>{() => (ok() ? "geçerli" : "geçersiz")}</Badge></Row>
        </div>
      },
    },
    Empty: {
      code: `<Empty icon={inbox} title="Henüz mesaj yok" action={<Button onClick={compose}>Yeni mesaj</Button>}>
  Gelen mesajlar burada listelenir.
</Empty>`,
      play: { options: [{ key: "icon", label: "Simge", default: true }, { key: "action", label: "Eylem düğmesi", default: true }] },
      run: (p: { values: { icon: boolean; action: boolean } }) => {
        const items = signal<string[]>([])
        return <div class="sc-ex-stack">
          {() => (items().length
            ? <div class="sc-ex-stack">{items().map((x) => <Row><Icon of={fileText} /> {x}</Row>)}<Button size="sm" variant="ghost" onClick={() => items.set([])}>Temizle</Button></div>
            : <Empty icon={p.values.icon ? inbox : undefined} title="Henüz rapor yok"
              action={p.values.action ? <Button variant="primary" onClick={() => items.set(["HADİ · Ekim raporu", "HADİ · Kasım raporu"])}>Örnek rapor ekle</Button> : undefined}>
              Oluşturduğun raporlar burada listelenir.
            </Empty>)}
        </div>
      },
    },
    ErrorBox: {
      code: `<ErrorBox title="Liste yüklenemedi" error={err} retry={() => reload()} />`,
      play: { options: [{ key: "title", label: "Başlık", default: true }, { key: "retry", label: "Yeniden dene", default: true }] },
      run: (p: { values: { title: boolean; retry: boolean } }) => {
        const tries = signal(1), ok = signal(false)
        const retry = async () => { tries.update((n) => n + 1); await wait(300); if (tries() >= 3) ok.set(true) }
        return <div class="sc-ex-stack">
          {() => (ok()
            ? <Row><Badge tone="success">Yüklendi</Badge><Button size="sm" variant="ghost" onClick={() => { ok.set(false); tries.set(1) }}>Baştan</Button></Row>
            : <ErrorBox {...(p.values.title ? { title: "Siparişler yüklenemedi" } : {})} error={() => new Error(`Sunucu yanıt vermedi (deneme ${tries()})`)} {...(p.values.retry ? { retry } : {})} />)}
        </div>
      },
    },
    Feed: {
      code: `<Feed posts={posts} hasMore={hasMore} onLoadMore={loadPage} onRefresh={reload}
  newCount={() => fresh.length} onShowNew={merge}
  onLike={(next, post) => like(post.id, next)} />`,
      play: { options: [{ key: "variant", label: "Görünüm", default: "card", options: [{ value: "card", label: "kart" }, { value: "flat", label: "düz" }] }, { key: "loading", label: "Yükleniyor", default: false }] },
      run: (p: { values: { variant: "card" | "flat"; loading: boolean } }) => {
        const posts = signal<Post[]>(POSTS.map((x) => ({ ...x })))
        const fresh = signal(1)
        const like = (next: boolean, post: Post) => posts.update((l) => l.map((x) => (x.id === post.id ? { ...x, liked: next, likes: x.likes + (next ? 1 : -1) } : x)))
        const merge = () => { posts.update((l) => [{ id: `n${Date.now()}`, author: { name: "Deniz Kaya", handle: "deniz" }, time: Date.now(), text: "Yeni gönderi: HADİ panosu artık karanlık temada.", likes: 0 }, ...l]); fresh.set(0) }
        return <div class="sc-ex-ui-b-feed">
          <Feed posts={() => (p.values.loading ? [] : posts())} loading={() => p.values.loading} variant={() => p.values.variant}
            newCount={fresh} onShowNew={merge} onLike={like} label="HADİ akışı" />
        </div>
      },
    },
    Field: {
      code: `<Field label="Takma ad" help="3–20 karakter" error={nick.length < 3 ? "Çok kısa" : null} required>
  <TextInput bind:value={$nick} />
</Field>
<Form schema={Profile}><Field name="email" /></Form>   // a schema field's own control`,
      play: { options: [{ key: "inline", label: "Etiket yanda", default: false }, { key: "required", label: "Zorunlu", default: true }] },
      run: (p: { values: { inline: boolean; required: boolean } }) => {
        const nick = signal("ad")
        const err = () => (nick().trim().length < 3 ? "En az 3 karakter" : nick().length > 20 ? "En çok 20 karakter" : null)
        return <div class="sc-ex-stack">
          {() => { const inl = p.values.inline, req = p.values.required; return <Field label="Takma ad" help="3–20 karakter" error={err()} required={req} inline={inl}><TextInput value={nick} /></Field> }}
          <Out label="Hata" value={() => err() ?? "yok"} />
        </div>
      },
    },
    FieldContext: {
      code: `function HintedInput() {
  const f = useContext(FieldContext)      // set by the enclosing <Field>
  return <input id={f?.id} aria-describedby={f?.describedby?.()} aria-invalid={f?.invalid?.()} />
}`,
      run: () => {
        const v = signal("")
        const Own = () => {
          const f = useContext(FieldContext)
          return <div class="sc-ex-stack"><input class="hm-input" id={f?.id ?? ""} aria-describedby={() => f?.describedby?.() ?? null} aria-invalid={() => String(!!f?.invalid?.())} value={v()} onInput={(e: Event) => v.set((e.target as HTMLInputElement).value)} />
            <Out label="id" value={f?.id ?? "—"} /><Out label="describedby" value={() => f?.describedby?.() || "—"} /></div>
        }
        return <Field label="Kendi denetimim" help="Etiket bu girdiyi bulur"><Own /></Field>
      },
    },
  },
})
