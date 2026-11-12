// API examples of hadi-march/ui, names "FileUpload" … "FormContext" (code-point order; the neighbouring ranges: ui-b*.tsx).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`; components have Playground options.
import { signal, useContext } from "hadi-march";
import {
  Field, Form, Button, Badge, FileUpload, FollowButton, FormActions, FormContext, type FollowState, type FormController,
} from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { wait, useLog, Profile } from "./_ui-b.tsx";
import "./ui-b.css";
export { default as SIG } from "./ui-b3.sig.gen.ts";

export default examples({
  "hadi-march/ui": {
    FileUpload: {
      code: `<FileUpload accept="image/*,.pdf" multiple maxSize={5_000_000} bind:value={$files}
  upload={(file, { onProgress }) => api.upload(file, onProgress)} />`,
      play: { options: [{ key: "multiple", label: "Birden çok", default: true }, { key: "accept", label: "Tür", default: "image/*", options: [{ value: "image/*", label: "görsel" }, { value: ".pdf,.txt", label: "belge" }, { value: "", label: "hepsi" }] }] },
      run: (p: { values: { multiple: boolean; accept: string } }) => {
        const value = signal<unknown>(null), log = useLog()
        const upload = async (file: File, ctx: { onProgress: (n: number) => void }) => {
          for (let i = 1; i <= 4; i++) { await wait(150); ctx.onProgress(i / 4) }
          return `acme://dosya/${file.name}`
        }
        return <div class="sc-ex-stack">
          {() => { const m = p.values.multiple, a = p.values.accept; return <FileUpload value={value} multiple={m} accept={a || undefined} maxSize={2_000_000} upload={upload}
            label="Dosya bırak ya da seç (en çok 2 MB)" onError={(msg: string) => log.push(msg)} onChange={() => log.push("değer değişti")} /> }}
          <Out label="Değer" value={() => JSON.stringify(value())} />
          <Log lines={log.lines} />
        </div>
      },
    },
    FollowButton: {
      code: `<FollowButton state={() => $state} private={account.private} name="Acme"
  onChange={(next) => { $state = next; api.follow(account.id, next) }} />`,
      play: { options: [{ key: "private", label: "Gizli hesap", default: false }, { key: "size", label: "Boyut", default: "md", options: ["sm", "md"] }] },
      run: (p: { values: { private: boolean; size: "sm" | "md" } }) => {
        const state = signal<FollowState>("follow"), log = useLog()
        return <div class="sc-ex-stack">
          <Row><strong>Acme</strong><FollowButton state={state} private={() => p.values.private} size={() => p.values.size} name="Acme" onChange={(n) => { state.set(n); log.push(n) }} /></Row>
          <Log lines={log.lines} />
        </div>
      },
    },
    Form: {
      code: `const Profile = schema({ name: { type: "text", required: true }, email: { type: "email", required: true } })
<Form schema={Profile} initial={{ name: "Ada" }} cancel submitLabel="Kaydet"
  onSubmit={(values) => api.save(values)} />`,
      play: { options: [{ key: "layout", label: "Yerleşim", default: "stack", options: [{ value: "stack", label: "alt alta" }, { value: "grid", label: "ızgara" }] }, { key: "requireDirty", label: "Değişince etkin", default: false }] },
      run: (p: { values: { layout: "stack" | "grid"; requireDirty: boolean } }) => {
        const log = useLog()
        return <div class="sc-ex-stack">
          {() => { const l = p.values.layout, rd = p.values.requireDirty; return <Form schema={Profile} layout={l} cols={2} requireDirty={rd} initial={{ name: "Ada" }} cancel submitLabel="Kaydet"
            onSubmit={async (v: Record<string, unknown>) => { await wait(400); if (String(v.email).startsWith("taken")) throw Object.assign(new Error("Reddedildi"), { fieldErrors: { email: "Bu adres kayıtlı" } }); log.push(`gönderildi: ${v.name} · ${v.email} · ${v.team}`) }} /> }}
          <p class="hm-muted">İpucu: "taken@acme.test" sunucu hatası verir.</p>
          <Log lines={log.lines} />
        </div>
      },
    },
    FormActions: {
      code: `<Form schema={Profile} actions={false}>
  <Field name="name" />
  <FormActions cancel requireDirty submitLabel="Kaydet" extra={<Button variant="ghost">Taslak</Button>} />
</Form>`,
      play: { options: [{ key: "cancel", label: "Vazgeç düğmesi", default: true }, { key: "requireDirty", label: "Değişince etkin", default: true }] },
      run: (p: { values: { cancel: boolean; requireDirty: boolean } }) => {
        const log = useLog()
        return <div class="sc-ex-stack">
          <Form schema={Profile} actions={false} initial={{ name: "Ada", email: "ada@acme.test" }} onSubmit={async (v: Record<string, unknown>) => { await wait(500); log.push(`kaydedildi: ${v.name}`) }}>
            <Field name="name" />
            {() => { const c = p.values.cancel, rd = p.values.requireDirty; return <FormActions cancel={c} requireDirty={rd} submitLabel="Kaydet" busyLabel="Kaydediliyor…"
              extra={<Button variant="ghost" onClick={() => log.push("taslak saklandı")}>Taslak</Button>} /> }}
          </Form>
          <Log lines={log.lines} />
        </div>
      },
    },
    FormContext: {
      code: `function DirtyBadge() {
  const form = useContext(FormContext)    // the enclosing <Form>'s controller
  return <Badge>{() => (form?.dirty() ? "kaydedilmedi" : "kayıtlı")}</Badge>
}`,
      run: () => {
        const Status = () => {
          const form = useContext(FormContext) as FormController | null
          return <Row>
            <Badge tone={() => (form?.dirty() ? "warn" : "success")}>{() => (form?.dirty() ? "kaydedilmedi" : "kayıtlı")}</Badge>
            <Out label="geçerli" value={() => String(form?.valid())} />
            <Button size="sm" variant="ghost" onClick={() => form?.reset()}>Geri al</Button>
          </Row>
        }
        return <Form schema={Profile} actions={false} initial={{ name: "Ada", email: "ada@acme.test" }}><Field name="email" /><Status /></Form>
      },
    },
  },
})
